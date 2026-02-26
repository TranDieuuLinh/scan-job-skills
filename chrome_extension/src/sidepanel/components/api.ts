const URL = import.meta.env.VITE_BACKEND;

export const fetchSkills = async (keyword: string) => {
  try {
    const response = await fetch(`${URL}skills/?keyword=${keyword}`);
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Skills fetch error:", error);
    return [];
  }
};

export const fetchJobsMatch = async (skill: string, keyword: string) => {
  try {
    const response = await fetch(
      `${URL}job_id/?skill_title=${encodeURIComponent(skill)}&keyword=${encodeURIComponent(keyword)}`
    );
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return [];
  }
};

export const fetchSkillsTrend = async (skill:string, keyword:string) => {
    try {
        const response = await fetch(
            `${URL}skills_trend/?skill_title=${encodeURIComponent(skill)}&keyword=${encodeURIComponent(keyword)}}`
          );
          return response.ok ? await response.json() : [];
    } catch (error) {
        console.error("Skills trend fetch error:", error);
        return [];
    }
}