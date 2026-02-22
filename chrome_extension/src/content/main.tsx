import * as chrono from "chrono-node";
const duplicateIdUrl = new Set<string>();

async function scanJobs(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const companyName = document
      .querySelector(".job-details-jobs-unified-top-card__company-name")
      ?.textContent?.trim();
    const jobName = document
      .querySelector(".job-details-jobs-unified-top-card__job-title")
      ?.textContent?.trim();
    const jobUrl = document.querySelector<HTMLAnchorElement>(
      ".job-details-jobs-unified-top-card__job-title h1 a"
    )?.href;
    const jobId = jobUrl?.match(/\/jobs\/view\/(\d+)/)?.[1];

    const jobDescr = document
      .querySelector(".jobs-box__html-content")
      ?.textContent?.trim();
    const cleanDesc = jobDescr?.replace(/\s+/g, " ").trim();

    const arrjobPublishedDate = document.querySelectorAll(
      ".job-details-jobs-unified-top-card__tertiary-description-container span span"
    );
    const publisheddate = [...arrjobPublishedDate][4]?.textContent?.trim();
    const cleanedDate = publisheddate
      ? chrono.parseDate(publisheddate.replace(/Reposted\s+/i, ""))
      : null;

    const input = document
      .querySelector(
        ".jobs-search-box__keyboard-text-input--reflowed.jobs-search-box__ghost-text-input"
      )
      ?.getAttribute("title");
    const keyword = input?.split("/")[0].trim();
    const location = input?.split("/")[1].trim();

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
