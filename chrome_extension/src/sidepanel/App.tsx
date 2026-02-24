import { useEffect, useState } from "react";

interface Skill {
  skill_title: string;
  count: number;
}

const App = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [keyword, setKeyword] = useState<string | null>(null);

  useEffect(() => {
    const updateUI = async (val: string) => {
      setKeyword(val);
      const response = await getSkills(val);
      if (response) setSkills(response);
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
    <div className="px-7 py-4 text-sm bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-center text-blue-600">
          {keyword ? keyword.toUpperCase() : "NO KEYWORD"}
        </h2>
      </div>
      <p className="text-xs pb-3 font-extrabold">Required Skills</p>
      <div className="h-45 overflow-y-auto space-y-2 relative">
        {skills.length > 0 ? (
          skills.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border px-3 py-2 hover:shadow-sm transition"
            >
              <span className="font-medium text-gray-700">{p.skill_title}</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold">
                {p.count} jobs
              </span>
            </div>
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
    </div>
  );
};

export default App;
