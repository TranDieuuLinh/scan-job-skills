from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.models.db import get_db
from src.utils import skill_services
from src.crud.skillsCrud import add_skills_to_db, check_skills_exist, get_skills_from_db, get_job_match_from_db, get_skills_graph_from_db
from src.utils.job_services import syn_keyword_search
from src.utils.job_titles_list import job_titles
from pydantic import BaseModel
from datetime import datetime, timedelta

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
    return skills_list


@router.get("/job_id/")
def get_match_jobs(skill_title: str, keyword: str, db: Session = Depends(get_db)):
    keyword = syn_keyword_search(keyword, job_titles)
    return get_job_match_from_db(skill_title, keyword, db)


@router.get("/skills_trend/")
def get_skills_trend(keyword: str, skill_title: str, db: Session = Depends(get_db)):
    keyword = syn_keyword_search(keyword, job_titles)
    dic = {}
    timecutoff = datetime.now() - timedelta(days=90)
    data = get_skills_graph_from_db(keyword, skill_title, db)
    for l in data:
        if l["date"] >= timecutoff.date():
            dic.setdefault(l["date"], {"date": l["date"]})
            dic[l["date"]][l["skill_title"]] = l["count"]
    sorted_results = sorted(
        dic.values(), key=lambda x: x["date"])
    return sorted_results
