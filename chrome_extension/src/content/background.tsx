chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.jobs) {
    chrome.runtime.sendMessage({ jobs: msg.jobs });
  }
});
