import * as chrono from "chrono-node";
const duplicateIdUrl = new Set<string>();

async function scanJobs(): Promise<void> {
  console.log("Scanning jobs...");
  for (let i = 0; i < 10; i++) {
    const companyName =
      document
        .querySelector(".job-details-jobs-unified-top-card__company-name")
        ?.textContent?.trim() ||
      document
        .querySelector(".fac80ba8.df7538bc._9f38382d._3fb3cb84")
        ?.textContent?.trim();

    const jobName =
      document
        .querySelector(".job-details-jobs-unified-top-card__job-title")
        ?.textContent?.trim() ||
      document
        .querySelector(
          "._38df260a.dfe14dc5._52d76f7b._0bb93b49.fe9c0fa3._1843f717._7f44e616.fac80ba8._3607329d"
        )
        ?.textContent?.trim();

    const jobUrl =
      document.querySelector<HTMLAnchorElement>(
        ".job-details-jobs-unified-top-card__job-title h1 a"
      )?.href ||
      document.querySelector<HTMLAnchorElement>(
        "._38df260a.dfe14dc5._52d76f7b._0bb93b49.fe9c0fa3._1843f717._7f44e616.fac80ba8._3607329d a"
      )?.href;

    const jobId = jobUrl?.match(/\/jobs\/view\/(\d+)/)?.[1];

    const jobDescr =
      document.querySelector(".jobs-box__html-content")?.textContent?.trim() ||
      document
        .querySelector('div._72a29cf0 span[data-testid="expandable-text-box"]')
        ?.textContent?.trim();
    const cleanDesc = jobDescr?.replace(/\s+/g, " ").trim();

    const arrjobPublishedDate = document.querySelectorAll(
      ".job-details-jobs-unified-top-card__tertiary-description-container span span"
    );
    const publisheddate =
      [...arrjobPublishedDate][4]?.textContent?.trim() ||
      document
        .querySelectorAll(
          "p._38df260a._5af038a6._52d76f7b._0bb93b49._227636e9._1843f717._7f44e616.f699eb09._3607329d span.f699eb09"
        )[1]
        .textContent?.trim();
    const cleanedDate = publisheddate
      ? chrono.parseDate(publisheddate.replace(/Reposted\s+/i, ""))
      : null;

    const input = document
      .querySelector(
        ".jobs-search-box__keyboard-text-input--reflowed.jobs-search-box__ghost-text-input"
      )
      ?.getAttribute("title");
    const keyword =
      input?.split("/")[0].toLowerCase().trim() ||
      document
        .querySelector<HTMLInputElement>('[componentkey="semanticSearchBox"]')
        ?.value.trim();

    if (keyword) await saveMyData(keyword);

    const location =
      input?.split("/")[1].trim() ||
      document
        .querySelector(
          "._38df260a._2ef9145d.c858e1a4.cf0654c8._52d76f7b._0bb93b49.fe9c0fa3._1843f717._7f44e616._0ade2530._3607329d"
        )
        ?.textContent?.trim();

    if (
      companyName &&
      jobUrl &&
      jobName &&
      jobId &&
      cleanDesc &&
      cleanedDate &&
      keyword &&
      location
    ) {
      const key = `${keyword}__${jobId}`;
      if (!duplicateIdUrl.has(key)) {
        duplicateIdUrl.add(key);
        await saveJobsDB(
          jobId,
          companyName,
          jobName,
          jobUrl,
          cleanDesc,
          cleanedDate,
          keyword,
          location
        );
      }
      break;
    }

    await new Promise((res) => setTimeout(res, 300));
  }
}

async function saveMyData(data: string) {
  try {
    await chrome.storage.local.set({ input: data });
    console.log("Data successfully saved!");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

async function saveJobsDB(
  jobId: string,
  companyName: string,
  jobName: string,
  jobUrl: string,
  cleanDesc: string,
  cleanedDate: Date,
  keyword: string,
  location: string
) {
  const URL = import.meta.env.VITE_BACKEND;

  try {
    const response = await fetch(`${URL}jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: jobId,
        job_title: jobName,
        job_description: cleanDesc,
        job_location: location,
        job_company: companyName,
        job_published_date: cleanedDate,
        job_url: jobUrl,
        keyword: keyword,
      }),
    });

    if (!response.ok) console.log(`Trouble Adding Job: ${jobName}`);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;

  const jobcard = target.closest("li");
  if (!jobcard) return;
  const container = jobcard.closest(".PMYdtziyXIFrOynXkfOQhEmDuYzLwmDfpI");
  if (!container) return;

  await new Promise((r) => setTimeout(r, 500));

  await scanJobs();
});

const container = document.querySelector(
  'div[componentkey="SearchResultsMainContent"]'
);

if (container) {
  container.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    const jobCard = target.closest('div[data-view-name="job-search-job-card"]');
    if (!jobCard) return;

    await new Promise((r) => setTimeout(r, 1000));
    await scanJobs();
  });
}


await scanJobs()