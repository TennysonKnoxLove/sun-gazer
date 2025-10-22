"""
API Routes
"""
from fastapi import APIRouter

from app.api import dashboard, sites, alerts, settings, fetch, auth

api_router = APIRouter()

# Include sub-routers
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(sites.router, prefix="/sites", tags=["sites"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(fetch.router, prefix="/fetch", tags=["fetch"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

