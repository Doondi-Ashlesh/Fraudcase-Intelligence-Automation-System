from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.db.feedback_db import init_db as init_feedback_db
from app.db.database import init_db as init_main_db
from app.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize DBs
    init_feedback_db()
    try:
        init_main_db()
    except Exception as e:
        print(f"WARNING: Main Database (PostgreSQL) initialization failed: {e}")

app.include_router(routes.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to FraudSight AI API", "version": "1.0.0"}
