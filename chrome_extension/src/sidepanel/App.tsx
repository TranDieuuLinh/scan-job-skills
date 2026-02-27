import { useEffect, useState } from "react";
import { Skill, Job, SkillTrend } from "./components/types";
import {
  fetchSkills,
  fetchJobsMatch,
  fetchSkillsTrend,
} from "./components/api";
import { JobCard } from "./components/jobcard";
import SkillCharts from "./components/charts";
import { HiMiniInformationCircle } from "react-icons/hi2";

const App = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [trend, setTrends] = useState<SkillTrend[]>([]);

  useEffect(() => {
    const updateUI = async (val: string) => {
      setKeyword(val);

      const skillsData = await fetchSkills(val);
      setSkills(skillsData);

      if (skillsData && skillsData.length > 0) {
        const firstSkill = skillsData[0].skill_title;
        setActiveValue(firstSkill);

        const [jobsData, trendData] = await Promise.all([
          fetchJobsMatch(firstSkill.toLowerCase(), val),
          fetchSkillsTrend(firstSkill.toLowerCase(), val),
        ]);

        setJobs(jobsData);
        setTrends(trendData);
      } else {
        setJobs([]);
        setTrends([]);
      }
    };

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.input?.newValue) {
        updateUI(changes.input.newValue as string);
      }
    });

    chrome.storage.local.get("input").then((result) => {
      if (result.input) updateUI(result.input as string);
    });
  }, []);

  const handleSkillClick = async (skill: string) => {
    setActiveValue(skill);

    const [resultData, trendData] = await Promise.all([
      fetchJobsMatch(skill.toLowerCase(), keyword || ""),
      fetchSkillsTrend(skill.toLowerCase(), keyword || ""),
    ]);
    setJobs(resultData);
    setTrends(trendData);
  };

  return (
    <div className="p-4 text-sm bg-white w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold text-center text-blue-600 mb-4">
        {keyword?.toUpperCase() || "NO KEYWORD"}
      </h2>

      <section>
        <p className="font-extrabold mb-2">Required Skills</p>
        <div className="h-32 overflow-y-auto space-y-2 ">
          {skills.length > 0 ? (
            skills.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSkillClick(s.skill_title)}
                className={`flex items-center justify-between rounded border px-3 w-full py-2 transition-all cursor-pointer ${
                  activeValue === s.skill_title
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <span className="font-medium">{s.skill_title}</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  {s.count} jobs
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-centerrounded-xl">
              <HiMiniInformationCircle className="w-6 h-6 text-blue-500" />
              <p className="text-gray-700 font-medium leading-relaxed">
                No skills detected yet.
              </p>
              <p className="text-gray-500 text-xs mt-2 text-center">
                Try clicking a few job listings on the left, then restart this
                panel to see the skill analysis.
              </p>
            </div>
          )}
        </div>
      </section>
      {jobs.length > 0 && (
        <section className="mt-6">
          <p className="font-extrabold mb-2 text-gray-800">Matching Jobs</p>
          <div className="h-47 overflow-y-auto space-y-2 pr-1">
            {jobs.map((j) => (
              <JobCard key={j.job_id} job={j} />
            ))}
          </div>
        </section>
      )}
      {trend.length > 0 && (
        <section className="mt-6">
          <p className="font-extrabold mb-2">Skills Trend</p>
          <div className="bg-white rounded-lg h-64 p-2">
            <SkillCharts skillTrend={trend} />
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
