from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from models.db import get_db
from collections import Counter
from utils import skill_services
from crud.skillsCrud import add_skills_to_db, check_skills_exist, get_skills_from_db
from utils.job_services import syn_keyword_search
from utils.job_titles_list import job_titles
from pydantic import BaseModel

router = APIRouter()


class SkillCreate(BaseModel):
    keyword: str


@router.post("/skills", status_code=status.HTTP_201_CREATED)
def filter_skills(s: SkillCreate, db: Session = Depends(get_db)):
    keyword = syn_keyword_search(s.keyword, job_titles)

    rows = skill_services.get_descr_by_keyword(keyword, db)
    if not rows:
        return {"message": "No jobs found for this keyword"}

    for descr, job_id in rows:
        skills = skill_services.find_skills_by_desc(descr)
        for skill in skills:
            existing = check_skills_exist(db, keyword, skill, job_id)
            if (existing):
                continue
            add_skills_to_db(db, keyword.lower(), skill, job_id)
    db.commit()

    return {"message": "Skill Updated"}


@router.get("/skills")
def get_skills(keyword: str, db: Session = Depends(get_db)):
    keyword = syn_keyword_search(keyword, job_titles)
    skills_list = get_skills_from_db(keyword, db)

    unsorted = Counter(skills_list).most_common()
    skills_with_count = []
    for skill_title, count in unsorted:
        skills_with_count.append(
            {"skill_title": skill_title.title(), "count": count})
    return skills_with_count
