
from models.skills import Skills
from sqlalchemy.orm import Session
from sqlalchemy import select


def get_skills_from_db(keyword: str, db: Session):
    keyword = keyword.lower()
    stmt = select(Skills.skill_title).where(Skills.keyword == keyword)
    return db.execute(stmt).scalars().all()


def check_skills_exist(db: Session, keyword: str, skill_title: str, job_id: str):
    stmt = select(Skills).where(Skills.keyword == keyword.lower(),
                                Skills.skill_title == skill_title, Skills.job_id == job_id).limit(1)
    return db.scalars(stmt).first()


def add_skills_to_db(db: Session, keyword: str, skill_title: str, job_id: str):
    skill = Skills(keyword=keyword, skill_title=skill_title, job_id=job_id)
    db.add(skill)
    return skill
