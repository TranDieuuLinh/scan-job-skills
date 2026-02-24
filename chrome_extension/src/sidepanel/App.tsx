import { useEffect, useState } from "react";

interface Skill {
  skill_title: string;
  count: number;
}

const App = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string | null>(null);

  useEffect(() => {
    const updateUI = async (val: string) => {
      setKeyword(val);
      const response = await getSkills(val);
      if (response) setSkills(response);
      setActiveValue(response[0].skill_title);
    };

    (async () => {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.input?.newValue) {
          updateUI(changes.input.newValue as string);
        }
      });

      const result = await chrome.storage.local.get("input");
      if (result.input) {
        updateUI(result.input as string);
      }
    })();
  }, []);

  const getSkills = async (keyword: string) => {
    const URL = import.meta.env.VITE_BACKEND;
    try {
      const response = await fetch(`${URL}skills/?keyword=${keyword}`);
      if (!response.ok) throw new Error("API Error");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return (
    <div className="py-5 px-8 text-sm bg-white w-full">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-center text-blue-600">
          {keyword ? keyword.toUpperCase() : "NO KEYWORD"}
        </h2>
      </div>
      <p className="text-sm py-2  font-extrabold">Required Skills</p>

      <div className="h-45  overflow-y-auto space-y-2 relative ">
        {skills.length > 0 ? (
          skills.map((p) => (
            <button
              onClick={() => setActiveValue(p.skill_title)}
              className={`flex items-center justify-between rounded border px-3 w-full py-2 transition-all ${
                activeValue === p.skill_title
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium text-gray-700">{p.skill_title}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-bold ${
                  activeValue === p.skill_title
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {p.count} jobs
              </span>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-400 mt-10">
            Nothing here yet!
            <div>
              Click through a few job listings on the left so we can analyse the
              requirements for you.
            </div>
          </p>
        )}
      </div>
      <p className="text-sm pt-8 pb-1  font-extrabold">Matching Jobs</p>
      <div className="h-45  overflow-y-auto space-y-2 relative">
        {activeValue?.toLowerCase()} {keyword}
      </div>
    </div>
  );
};

export default App;
