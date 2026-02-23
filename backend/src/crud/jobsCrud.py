from schemas.jobschemas import JobCreate
from sqlalchemy.orm import Session
from models.job import Job
from sqlalchemy import select, and_


def create_jobs(job: JobCreate, db: Session):
    all_jobs = Job(**job.model_dump())
    db.add(all_jobs)
    db.commit()
    db.refresh(all_jobs)
    return all_jobs


def get_job_by_idKeyword(db: Session, id: str, keyword: str):
    stmt = select(Job).where(
        and_(Job.job_id == id, Job.keyword == keyword)
    ).limit(1)
    return db.scalars(stmt).first()



