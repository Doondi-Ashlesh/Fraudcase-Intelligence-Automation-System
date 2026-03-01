from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.db.feedback_db import init_db
from app.services.vector_store_service import vector_store
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
    # Initialize DB
    init_db()
    # Load vector store if it exists
    vector_store.load()

app.include_router(routes.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to FraudSight AI API", "version": "1.0.0"}
