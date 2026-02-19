const duplicate = new Set<string>();
const jobs: string[] = [];

export function scanJobs() {
  const top = document.querySelector(
    '[componentkey="SearchResultsMainContent"]'
  );
  if (!top) return;

  const cards = top.querySelectorAll(
    '[componentkey^="job-card-component-ref-"]'
  );
  let count = false;
  cards.forEach((p) => {
    const title = p.querySelector("p")?.innerText.trim();
    const index = title?.indexOf("(Verified job)");
    let normalizedTitle = index !== -1 ? title?.substring(0, index).trim() : title?.trim();

    if (normalizedTitle && !duplicate.has(normalizedTitle)) {
      duplicate.add(normalizedTitle);
      jobs.push(normalizedTitle);
      count = true;
    }
  });

  if (count) {
    console.log("sent");
    chrome.runtime.sendMessage({ jobs });
  }
}

setInterval(scanJobs, 3000);
