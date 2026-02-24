import * as chrono from "chrono-node";
const duplicateIdUrl = new Set<string>();

async function scanJobs(): Promise<void> {
  console.log("scanning...");
  for (let i = 0; i < 10; i++) {
    const jobTitleLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="/jobs/view/"]'
    );
    const companyName = document
      .querySelector('a[href*="/company/"]')
      ?.textContent?.trim();
    const meta = document.querySelectorAll("span._05c6eb4c");
    const jobDescr = document.querySelector(
      'span[data-testid="expandable-text-box"]'
    );
    const keyword =
      document
        .querySelector<HTMLInputElement>('[componentkey="semanticSearchBox"]')
        ?.value.trim() || "unknown";

    const jobName = jobTitleLink?.textContent?.trim();
    const jobUrl = jobTitleLink?.href;
    const jobId = jobUrl?.match(/\/view\/(\d+)/)?.[1];
    const cleanDesc = jobDescr?.textContent?.replace(/\s+/g, " ").trim();
    const location = meta[0]?.textContent?.trim();

    if (companyName && jobName && jobId && cleanDesc && location) {
      const key = `${keyword}__${jobId}`;
      if (!duplicateIdUrl.has(key)) {
        duplicateIdUrl.add(key);

        await Promise.all([
          saveJobsDB({
            jobId,
            companyName,
            jobName,
            jobUrl: jobUrl!,
            cleanDesc,
            location,
            keyword,
            date: meta[1]?.textContent,
          }),
          chrome.storage.local.set({ input: keyword, lastUpdated: Date.now() }),
          updateBackend(`${import.meta.env.VITE_BACKEND}skills`, { keyword }),
        ]);
        return;
      }
    }
    await new Promise((res) => setTimeout(res, 300));
  }
}

async function updateBackend(url: string, body: object) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error(`Failed: ${url}`);
  } catch (e) {
    console.error(e);
  }
}

async function saveJobsDB(data: any) {
  const {
    jobId,
    companyName,
    jobName,
    jobUrl,
    cleanDesc,
    location,
    keyword,
    date,
  } = data;
  await updateBackend(`${import.meta.env.VITE_BACKEND}jobs`, {
    job_id: jobId,
    job_title: jobName,
    job_description: cleanDesc,
    job_location: location,
    job_company: companyName,
    job_published_date: date ? chrono.parseDate(date) : null,
    job_url: jobUrl,
    keyword,
  });
}

const triggerScan = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  scanJobs();
};

const container = document.querySelector(
  'div[componentkey="SearchResultsMainContent"]'
);

if (container) {
  container.addEventListener("click", (e) => {
    if (
      (e.target as HTMLElement).closest(
        'div[data-view-name="job-search-job-card"]'
      )
    )
      triggerScan();
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    (e.target as HTMLElement).closest('[componentkey="semanticSearchBox"]')
  )
    triggerScan();
});

scanJobs();
