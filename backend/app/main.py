import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.supabase_client import is_supabase_enabled
from app.routes import auth, resume, job, match, interview, voice, dashboard

app = FastAPI(
    title="AI Interview Preparation Assistant API",
    description="Full-stack AI-powered interview platform with Supabase, Resume/JD Matching, RAG Question Bank, and Gemini 3.8 Flash evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development & deployment ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(job.router)
app.include_router(match.router)
app.include_router(interview.router)
app.include_router(voice.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI Interview Preparation Assistant API",
        "version": "1.0.0",
        "database": "Supabase PostgreSQL" if is_supabase_enabled() else "Mock In-Memory Store (Supabase credentials pending)",
        "llm_engine": "Gemini 3.8 Flash" if (settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY) else "Heuristic / RAG Fallback Mode",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "supabase_connected": is_supabase_enabled(),
        "environment": settings.ENVIRONMENT
    }
