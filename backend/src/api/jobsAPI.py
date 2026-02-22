from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from models.db import get_db
from schemas.jobschemas import JobCreate
from crud import jobsCrud

router = APIRouter()


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def add_jobs(job: JobCreate, db: Session = Depends(get_db)):
    existing = jobsCrud.get_job_by_idKeyword(db, job.job_id, job.keyword)
    if (existing):
        return {"message": f"Already exist for job id {existing.job_id}"}
    new_job = jobsCrud.create_jobs(job, db)
    return {"message": "Job added", "job_id": new_job.job_id}


@router.get("/jobs", status_code=200)
def get_jobs(db: Session = Depends(get_db)):
    return jobsCrud.get_all_jobs(db)
