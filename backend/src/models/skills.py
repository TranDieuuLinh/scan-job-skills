from src.models.db import Base
from sqlalchemy import Column, String, Integer, UniqueConstraint, ForeignKeyConstraint


class Skills (Base):
    __tablename__ = "skills_by_ai"

    skill_id = Column(Integer, index=True, primary_key=True)
    keyword = Column(String, nullable=False)
    skill_title = Column(String, nullable=False)
    job_id = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("job_id", "keyword", "skill_title", name="uix_1"),
    )
