
from models.skills import Skills
from models.job import Job
from sqlalchemy.orm import Session
from sqlalchemy import select,  and_, func, desc


def get_job_match_from_db(skill_title: str, keyword: str, db: Session):
    stmt = (select(Job).join(Skills, Job.job_id == Skills.job_id).where(
        and_(Skills.keyword == keyword.lower(), Skills.skill_title == skill_title)))
    return db.execute(stmt).scalars().all()


def get_skills_graph_from_db(keyword: str, skill_title:str, db: Session):
    stmt = (select(func.date(Job.job_published_date), Skills.skill_title, func.count(Skills.skill_title).label("count")).join(Skills, Job.job_id ==
            Skills.job_id).where(and_(Job.keyword == keyword.lower(), Skills.skill_title == skill_title)).group_by(func.date(Job.job_published_date), Skills.skill_title))
    return db.execute(stmt).mappings().all()


def get_skills_from_db(keyword: str, db: Session):
    stmt = (select(Skills.skill_title, func.count(Skills.skill_title).label("count")).where(Skills.keyword == keyword.lower()).group_by(Skills.skill_title).order_by(desc("count")))
    return db.execute(stmt).mappings().all()


def check_skills_exist(db: Session, keyword: str, skill_title: str, job_id: str):
    stmt = select(Skills).where(Skills.keyword == keyword.lower(),
                                Skills.skill_title == skill_title, Skills.job_id == job_id).limit(1)
    return db.scalars(stmt).first()


def add_skills_to_db(db: Session, keyword: str, skill_title: str, job_id: str):
    skill = Skills(keyword=keyword, skill_title=skill_title, job_id=job_id)
    db.add(skill)
    return skill
