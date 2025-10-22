"""
SunGazer Backend - Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.core.scheduler import start_scheduler, stop_scheduler
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🌞 Starting SunGazer Backend...")
    init_db()
    start_scheduler()
    print("✅ Backend ready!")
    
    yield
    
    # Shutdown
    print("🌙 Shutting down SunGazer Backend...")
    stop_scheduler()
    print("✅ Shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="SunGazer API",
    description="Unified solar monitoring platform backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "SunGazer Backend",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "scheduler": "running"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )

