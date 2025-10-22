"""
Settings API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import json
import uuid
from loguru import logger

from app.core.database import get_db
from app.core.config import settings as config
from app.models import ApiKey

router = APIRouter()


# Simple in-memory settings storage (in production, use database)
# Initialize from config defaults
app_settings = {
    "polling": {
        "dashboard_ttl_minutes": config.DASHBOARD_TTL_MINUTES,
        "site_ttl_minutes": config.SITE_TTL_MINUTES,
        "poll_interval_minutes": config.POLL_INTERVAL_MINUTES,
        "max_repolls": config.MAX_REPOLLS,
        "inactivity_timeout_minutes": config.INACTIVITY_TIMEOUT_MINUTES
    },
    "theme": "system",
    "accent_color": "#1890ff"
}


@router.get("")
def get_settings():
    """Get application settings"""
    return app_settings


@router.patch("")
def update_settings(settings: dict):
    """Update application settings"""
    # Merge updates
    if "polling" in settings:
        app_settings["polling"].update(settings["polling"])
    if "theme" in settings:
        app_settings["theme"] = settings["theme"]
    if "accent_color" in settings:
        app_settings["accent_color"] = settings["accent_color"]
    
    return app_settings


@router.get("/api-keys")
def get_api_keys(db: Session = Depends(get_db)):
    """Get all API keys"""
    api_keys = db.query(ApiKey).all()
    
    return [
        {
            "id": key.id,
            "vendor": key.vendor,
            "key_masked": key.key_masked,
            "created": key.created.strftime("%Y-%m-%d") if key.created else None,
            "last_used": key.last_used.strftime("%Y-%m-%d") if key.last_used else None
        }
        for key in api_keys
    ]


@router.post("/api-keys")
def add_api_key(data: dict, db: Session = Depends(get_db)):
    """Add new API key"""
    from app.services.data_service import DataService
    
    vendor = data.get("vendor")
    key = data.get("key")
    
    if not vendor or not key:
        raise HTTPException(status_code=400, detail="Vendor and key are required")
    
    # Check if key already exists for this vendor
    existing = db.query(ApiKey).filter(ApiKey.vendor == vendor).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"API key for {vendor} already exists")
    
    # Create masked version
    key_masked = "***********" + key[-6:] if len(key) > 6 else "***" + key[-4:]
    
    # In production, encrypt the key before storing
    api_key = ApiKey(
        id=str(uuid.uuid4()),
        vendor=vendor,
        key_encrypted=key,  # TODO: Encrypt this
        key_masked=key_masked,
        created=datetime.utcnow()
    )
    
    db.add(api_key)
    db.commit()
    
    # Automatically fetch data when API key is added
    logger.info(f"API key added for {vendor}. Triggering initial data fetch...")
    try:
        data_service = DataService(db)
        sites = data_service.fetch_all_sites(vendor, key)
        logger.info(f"✅ Initial fetch: {len(sites)} sites from {vendor}")
        
        # Fetch details for first 3 sites
        for site in sites[:3]:
            try:
                data_service.fetch_site_overview(site.id, vendor, key)
                data_service.fetch_site_devices(site.id, vendor, key)
            except Exception as e:
                logger.error(f"Failed to fetch site details: {e}")
    except Exception as e:
        logger.error(f"Initial fetch failed for {vendor}: {e}")
    
    return {
        "id": api_key.id,
        "vendor": api_key.vendor,
        "key_masked": api_key.key_masked,
        "created": api_key.created.strftime("%Y-%m-%d")
    }


@router.delete("/api-keys/{key_id}")
def delete_api_key(key_id: str, db: Session = Depends(get_db)):
    """Delete an API key"""
    api_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    db.delete(api_key)
    db.commit()
    
    return {"status": "success", "message": "API key deleted"}


@router.post("/clear-cache")
def clear_cache():
    """Clear application cache"""
    # TODO: Implement cache clearing logic
    return {"status": "success", "message": "Cache cleared"}


@router.get("/export")
def export_data(db: Session = Depends(get_db)):
    """Export application data"""
    # TODO: Implement data export
    export_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "settings": app_settings,
        "version": "1.0.0"
    }
    
    return export_data


@router.post("/import")
def import_data(file: UploadFile = File(...)):
    """Import application data"""
    # TODO: Implement data import
    contents = file.file.read()
    try:
        data = json.loads(contents)
        return {"status": "success", "message": "Data imported successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid import file: {str(e)}")

