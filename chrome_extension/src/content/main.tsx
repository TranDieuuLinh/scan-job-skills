const duplicateIdUrl = new Set<string>();

/** Serializes scans so rapid clicks are not dropped by an in-flight scan. */
let scanQueue: Promise<void> = Promise.resolve();

type JobPayload = {
  jobId: string;
  companyName: string;
  jobName: string;
  jobUrl: string;
  cleanDesc: string;
  location: string;
  keyword: string;
  date?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Prefer URL: SPA updates currentJobId / path when a listing is selected. */
function jobIdFromAddress(): string | null {
  const { pathname, href } = location;
  let m = pathname.match(/\/jobs\/view\/(\d+)/);
  if (m?.[1]) return m[1];
  m = href.match(/[?&]currentJobId=(\d+)/);
  if (m?.[1]) return m[1];
  return null;
}

/** Smallest ancestor of the title link that still contains the description (detail pane root). */
function detailScopeForTitleAndDesc(
  title: HTMLAnchorElement | null,
  desc: Element | null
): Document | Element {
  if (!title || !desc) return document;
  let p: Element | null = title.parentElement;
  for (let i = 0; i < 24 && p; i++) {
    if (p.contains(desc)) return p;
    p = p.parentElement;
  }
  return document;
}

function normalizeText(s: string | null | undefined): string | undefined {
  const t = s?.replace(/\s+/g, " ").trim();
  return t && t.length > 0 ? t : undefined;
}

/**
 * Title link is often empty briefly after SPA navigation; fall back to headings / LinkedIn title hooks.
 */
function pickJobTitle(
  link: HTMLAnchorElement | null,
  searchRoot: Document | Element
): string | undefined {
  const fromLink = normalizeText(link?.textContent);
  if (fromLink) return fromLink;

  const h1 = searchRoot.querySelector("h1");
  const fromH1 = normalizeText(h1?.textContent);
  if (fromH1) return fromH1;

  const hooks = searchRoot.querySelectorAll(
    '[class*="job-details-jobs-unified-top-card__job-title"], [class*="jobs-unified-top-card__job-title"], [data-testid="job-search-job-card-title"]'
  );
  for (const el of hooks) {
    const t = normalizeText(el.textContent);
    if (t) return t;
  }
  return undefined;
}

function keywordFromSearch(): string {
  return (
    document
      .querySelector<HTMLInputElement>('[componentkey="semanticSearchBox"]')
      ?.value.trim() || "unknown"
  );
}

/**
 * Avoid document-wide first match for `/jobs/view/` (left rail). Anchor from the description
 * box and prefer `jobIdFromAddress()` so title/id match the open posting.
 */
function buildCompleteJobPayload(): JobPayload | null {
  const keyword = keywordFromSearch();
  const idFromUrl = jobIdFromAddress();

  const jobDescr = document.querySelector(
    '[data-testid="expandable-text-box"]'
  );
  const cleanDesc = normalizeText(jobDescr?.textContent);
  if (!jobDescr || !cleanDesc) return null;

  let scope: Element | null = jobDescr.parentElement;
  let jobTitleLink: HTMLAnchorElement | null = null;

  for (let depth = 0; depth < 28 && scope; depth++) {
    const links = Array.from(
      scope.querySelectorAll<HTMLAnchorElement>('a[href*="/jobs/view/"]')
    );
    const viable = links.filter((a) => {
      const m = a.href.match(/\/view\/(\d+)/);
      if (!m?.[1]) return false;
      if (idFromUrl && m[1] !== idFromUrl) return false;
      return true;
    });
    if (viable.length > 0) {
      jobTitleLink =
        (idFromUrl
          ? viable.find((a) => a.href.includes(`/view/${idFromUrl}`))
          : null) ?? viable[0];
      break;
    }
    scope = scope.parentElement;
  }

  if (!jobTitleLink && idFromUrl) {
    jobTitleLink =
      document.querySelector<HTMLAnchorElement>(
        `a[href*="/jobs/view/${idFromUrl}"]`
      ) ??
      Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href*="/jobs/view/"]')
      ).find((a) => a.href.includes(`/view/${idFromUrl}`)) ??
      null;
  }

  if (!jobTitleLink) {
    jobTitleLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="/jobs/view/"]'
    );
  }

  const searchRoot =
    scope ?? detailScopeForTitleAndDesc(jobTitleLink, jobDescr);

  const hrefMatch = jobTitleLink?.href?.match(/\/view\/(\d+)/)?.[1];
  const jobId = idFromUrl ?? hrefMatch;
  if (!jobId) return null;

  const jobUrl =
    jobTitleLink?.href ??
    `${window.location.origin}/jobs/view/${jobId}/`;

  const jobName = pickJobTitle(jobTitleLink, searchRoot);
  if (!jobName) return null;

  const companyName = normalizeText(
    searchRoot.querySelector('a[href*="/company/"]')?.textContent
  );
  if (!companyName) return null;

  const metaRow = Array.from(searchRoot.querySelectorAll("p")).find((p) => {
    const dots = (p.textContent?.match(/·/g) || []).length;
    return dots >= 2;
  });

  const metaParts =
    metaRow?.textContent?.split("·").map((s) => s.trim()) || [];
  const jobLocation = normalizeText(metaParts[0]);
  if (!jobLocation) return null;

  const dateText = normalizeText(metaParts[1]);

  return {
    jobId,
    companyName,
    jobName,
    jobUrl,
    cleanDesc,
    location: jobLocation,
    keyword,
    ...(dateText ? { date: dateText } : {}),
  };
}

function isCompletePayload(job: JobPayload): boolean {
  const required: (keyof JobPayload)[] = [
    "jobId",
    "companyName",
    "jobName",
    "jobUrl",
    "cleanDesc",
    "location",
    "keyword",
  ];
  return required.every((k) => {
    const v = job[k];
    return typeof v === "string" && v.trim().length > 0;
  });
}

async function scanJobs(): Promise<void> {
  console.log("scanJobs");

  for (let i = 0; i < 30; i++) {
    const payload = buildCompleteJobPayload();

    if (payload && isCompletePayload(payload)) {
      const key = `${payload.keyword}__${payload.jobId}`;
      if (!duplicateIdUrl.has(key)) {
        duplicateIdUrl.add(key);
        await saveJobsDB(payload);
      }
      return;
    }

    console.log(
      "scanJobs waiting for full job DOM",
      {
        urlJobId: jobIdFromAddress(),
        attempt: i + 1,
      },
      payload
        ? "(partial — should not save)"
        : "(no payload yet)"
    );

    await sleep(350);
  }

  console.warn("scanJobs gave up after retries — nothing saved");
}

function sendMessageAsync(message: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(response);
    });
  });
}

async function saveJobsDB(job: JobPayload): Promise<void> {
  if (!isCompletePayload(job)) {
    console.warn("saveJobsDB skipped: incomplete record", job);
    return;
  }
  await sendMessageAsync({ type: "SAVE_JOB", job });
  await sendMessageAsync({ type: "UPDATE_KEYWORD", keyword: job.keyword });
  await sendMessageAsync({ type: "UPDATE_SKILLS", keyword: job.keyword });
}

function enqueueScan(reason: string): void {
  console.log("enqueueScan", reason);
  scanQueue = scanQueue
    .catch((err) => console.error("scan queue error", err))
    .then(async () => {
      await sleep(1200);
      await scanJobs();
    });
}

/** LinkedIn uses shadow roots; closest() does not cross into/out of them reliably. */
function pathTouchesJobSearchCard(e: Event): boolean {
  const JOB_CARD = '[data-view-name="job-search-job-card"]';
  return e.composedPath().some((node) => {
    if (!(node instanceof Element)) return false;
    if (typeof node.matches === "function" && node.matches(JOB_CARD))
      return true;
    return node.getAttribute?.("data-view-name") === "job-search-job-card";
  });
}

function closestAcrossShadow(
  start: Element | null,
  selector: string
): Element | null {
  let el: Element | null = start;
  while (el) {
    try {
      const hit = el.closest(selector);
      if (hit) return hit;
    } catch {
      /* ignore */
    }
    const root = el.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof Element) {
      el = root.host;
    } else {
      break;
    }
  }
  return null;
}

let lastTrackedJobId: string | null = jobIdFromAddress();

function watchSelectedJobFromUrl(): void {
  window.setInterval(() => {
    const id = jobIdFromAddress();
    if (!id || id === lastTrackedJobId) return;
    lastTrackedJobId = id;
    enqueueScan("url-job-change");
  }, 400);
}

document.addEventListener(
  "click",
  (e) => {
    if (pathTouchesJobSearchCard(e)) enqueueScan("job-card-click");
  },
  { capture: true }
);

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    closestAcrossShadow(
      e.target as HTMLElement,
      '[componentkey="semanticSearchBox"]'
    )
  )
    enqueueScan("search-enter");
});

watchSelectedJobFromUrl();
enqueueScan("initial-load");
