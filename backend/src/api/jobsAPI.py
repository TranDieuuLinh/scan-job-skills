from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.models.db import get_db
from src.schemas.jobschemas import JobCreate
from src.crud import jobsCrud
from src.utils.job_services import syn_keyword_search
from src.utils.job_titles_list import job_titles
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def add_jobs(job: JobCreate, db: Session = Depends(get_db)):
    logger.info(
        f"[POST /jobs] Called with job_id={job.job_id}, keyword={job.keyword}")
    result = syn_keyword_search(job.keyword, job_titles)
    job.keyword = result.lower()

    existing = jobsCrud.get_job_by_idKeyword(db, job.job_id, job.keyword)
    if existing:
        logger.info(
            f"[POST /jobs] Already exists for job_id={existing.job_id}")
        return {"message": f"Already exist for job id {existing.job_id}"}

    new_job = jobsCrud.create_jobs(job, db)
    logger.info(f"[POST /jobs] Job added with job_id={new_job.job_id}")
    return {"message": "Job added", "job_id": new_job.job_id}


@router.get("/jobs")
def get_all_jobs(db: Session = Depends(get_db)):
    logger.info(f"[GET /jobs] Called")
    jobs_list = jobsCrud.get_all_jobs(db)
    logger.info(f"[GET /jobs] Returning {len(jobs_list)} jobs")
    return jobs_list
