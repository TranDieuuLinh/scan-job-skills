import { useEffect, useState } from "react";

function App() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.jobs) setJobs(msg.jobs);
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div>
      <h3>Live Jobs</h3>
      {jobs.length}
      {jobs.map((job, i) => (
        <div key={i}>
          <b>{job}</b>
        </div>
      ))}
    </div>
  );
}

export default App;
