from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.db import get_db
from utils import skill_services
from collections import Counter
from utils.job_services import syn_keyword_search
from utils.job_titles_list import job_titles

router = APIRouter()


@router.get("/skills/{keyword}")
def filter_skills(keyword: str, db: Session = Depends(get_db)):
    keyword = syn_keyword_search(keyword, job_titles)
    all_descr = skill_services.get_descr_by_keyword(keyword, db)
    skills_list = []
    for i in all_descr:
        each_skill = skill_services.find_skills_by_desc(i)
        skills_list.extend(each_skill)
    unsorted_skills = Counter(skills_list)
    return sorted(unsorted_skills.items(), key=lambda x: x[1], reverse=True)
