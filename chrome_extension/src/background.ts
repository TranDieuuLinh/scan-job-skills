import * as chrono from "chrono-node";

const URL = import.meta.env.VITE_BACKEND;
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      switch (msg.type) {
        case "FETCH_SKILLS": {
          const res = await fetch(`${URL}skills/?keyword=${msg.keyword}`);
          const data = res.ok ? await res.json() : [];
          sendResponse({ success: true, data });
          break;}

      case "FETCH_JOBS_MATCH":
        {
          const res = await fetch(
            `${URL}job_id/?skill_title=${encodeURIComponent(
              msg.skill
            )}&keyword=${encodeURIComponent(msg.keyword)}`
          );
          const data = res.ok ? await res.json() : [];
          sendResponse({ success: true, data });
        }
        break;

      case "FETCH_SKILLS_TREND":
        {
          const res = await fetch(
            `${URL}skills_trend/?skill_title=${encodeURIComponent(
              msg.skill
            )}&keyword=${encodeURIComponent(msg.keyword)}`
          );
          const data = res.ok ? await res.json() : [];
          sendResponse({ success: true, data });
        }
        break;

      case "SAVE_JOB":
        {
          const job = msg.job;
          const res = await fetch(`${URL}jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              job_id: job.jobId,
              job_title: job.jobName,
              job_description: job.cleanDesc,
              job_location: job.location,
              job_company: job.companyName,
              job_published_date: job.date ? chrono.parseDate(job.date) : null,
              job_url: job.jobUrl,
              keyword: job.keyword,
            }),
          });
          sendResponse({ success: res.ok });
        }
        break;
      case "UPDATE_SKILLS":
        {
          const keyword = msg.keyword;
          const res = await fetch(`${URL}skills`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({keyword}),
          });
          sendResponse({ success: res.ok });
        }
        break;
      case "UPDATE_KEYWORD":
        {
          await chrome.storage.local.set({
            input: msg.keyword,
            lastUpdated: Date.now(),
          });
          sendResponse({ success: true });
        }
        break;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
    }
  } catch (err) {
    console.error(err);
    sendResponse({ success: false, error: err });
  }
})();
  return true;
});
