from pydantic import BaseModel
from datetime import datetime


class JobCreate(BaseModel):
    job_id:str
    job_title: str
    job_description:str
    job_location:str
    job_company:str
    job_published_date: datetime
    job_url:str
    keyword:str