export interface Skill {
  skill_title: string;
  count: number;
}

export interface Job {
  job_id: string;
  job_title: string;
  job_description: string;
  job_location: string;
  job_company: string;
  job_published_date: string| Date;
  job_url: string;
  keyword: string;
}

export interface SkillTrend {
    skill_title: string;
    job_published_date: string| Date;
    count:number;
}
