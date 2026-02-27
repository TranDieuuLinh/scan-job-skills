
export async function fetchSkills(keyword: string) {
  const response = await chrome.runtime.sendMessage({ type: "FETCH_SKILLS", keyword });
  return response?.success ? response.data : [];
}

export async function fetchJobsMatch(skill: string, keyword: string) {
  const response = await chrome.runtime.sendMessage({ type: "FETCH_JOBS_MATCH",skill, keyword });
  return response?.success ? response.data : [];
}

export async function fetchSkillsTrend(skill: string, keyword: string) {
  const response = await chrome.runtime.sendMessage({ type: "FETCH_SKILLS_TREND",skill, keyword });
  return response?.success ? response.data : [];
}
