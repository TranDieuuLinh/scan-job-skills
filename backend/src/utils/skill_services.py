from sqlalchemy import select
from sqlalchemy.orm import Session
from utils.skill_dict_list import skill_keywords
from models.job import Job
from flashtext import KeywordProcessor

kp = KeywordProcessor(case_sensitive=False)
for skill, syn in skill_keywords.items():
    for s in syn:
        kp.add_keyword(s,skill)


def get_descr_by_keyword(keyword: str, db: Session):
    stmt = select(Job.job_description).where(Job.keyword == keyword.lower())
    return db.execute(stmt).scalars().all()


def find_skills_by_desc(job_descr: str):
    return set(kp.extract_keywords(job_descr))
   
