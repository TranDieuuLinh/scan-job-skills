const duplicateIdUrl = new Set<string>();

async function scanJobs(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const jobTitleLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="/jobs/view/"]'
    );
    const companyName = document
      .querySelector('a[href*="/company/"]')
      ?.textContent?.trim();
    const jobDescr = document.querySelector(
      '[data-testid="expandable-text-box"]'
    );
    const keyword =
      document
        .querySelector<HTMLInputElement>('[componentkey="semanticSearchBox"]')
        ?.value.trim() || "unknown";

    const metaRow = Array.from(document.querySelectorAll("p")).find((p) => {
      const dots = (p.textContent?.match(/·/g) || []).length;
      return dots >= 2;
    });

    const metaParts =
      metaRow?.textContent?.split("·").map((s) => s.trim()) || [];
    const location = metaParts[0];
    const dateText = metaParts[1];

    const jobName = jobTitleLink?.textContent?.trim();
    const jobUrl = jobTitleLink?.href;
    const jobId = jobUrl?.match(/\/view\/(\d+)/)?.[1];
    const cleanDesc = jobDescr?.textContent?.replace(/\s+/g, " ").trim();

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
            date: dateText,
          }),
        ]);
        return;
      }
    }
    await new Promise((res) => setTimeout(res, 300));
  }
}

async function saveJobsDB(job: any) {
  chrome.runtime.sendMessage({ type: "SAVE_JOB", job });
  chrome.runtime.sendMessage({
    type: "UPDATE_KEYWORD",
    keyword: job.keyword,
  });
  chrome.runtime.sendMessage({
    type: "UPDATE_SKILLS",
    keyword: job.keyword,
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
