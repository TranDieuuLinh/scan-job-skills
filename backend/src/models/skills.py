from models import Base
from sqlalchemy import Table, Column, String

class Skills (Base):
    __tablename__ = "skills_by_ai"
    skill_id = Column()