from .db import Base
from sqlalchemy import Column, String, DateTime, UniqueConstraint


class Job(Base):
    __tablename__ = "job_found_by_keyword"

    job_id = Column(String, primary_key=True)
    keyword = Column(String, primary_key=True)
    job_title = Column(String, nullable=False)
    job_description = Column(String, nullable=False)
    job_location = Column(String, nullable=False)
    job_company = Column(String, nullable=False)
    job_published_date = Column(DateTime(timezone=True), nullable=False)
    job_url = Column(String, nullable=False)
