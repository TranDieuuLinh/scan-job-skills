import os
from dotenv import load_dotenv
from fastapi import FastAPI
from models.db import Base, engine
from api.jobsAPI import router as jobs_router
from api.skillsAPI import router as skills_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
load_dotenv()

origins = [
    os.getenv("CORS_FRONTEND"),
    "http://127.0.0.1:5173",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(bind=engine)

app.include_router(jobs_router)
app.include_router(skills_router)


@app.get("/")
def read_root():
    return {"message": "API is running"}
