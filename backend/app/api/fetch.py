"""
Manual Fetch Endpoint - Trigger data fetching on demand
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.models import ApiKey
from app.services.data_service import DataService

router = APIRouter()


@router.post("/fetch-all")
def fetch_all_data(db: Session = Depends(get_db)):
    """
    Manually trigger data fetch from all vendors
    """
    try:
        # Get all API keys
        api_keys = db.query(ApiKey).all()
        
        if not api_keys:
            return {
                "status": "error",
                "message": "No API keys found. Please add API keys in Settings first."
            }
        
        data_service = DataService(db)
        results = []
        
        # Fetch sites for each vendor
        for api_key in api_keys:
            vendor = api_key.vendor
            key = api_key.key_encrypted  # In production, decrypt this
            
            logger.info(f"Fetching sites from {vendor}...")
            
            try:
                sites = data_service.fetch_all_sites(vendor, key)
                
                # Fetch details for first few sites (to avoid rate limits)
                sites_updated = 0
                for site in sites[:3]:  # Limit to 3 sites per vendor
                    try:
                        data_service.fetch_site_overview(site.id, vendor, key)
                        data_service.fetch_site_devices(site.id, vendor, key)
                        sites_updated += 1
                    except Exception as e:
                        logger.error(f"Failed to fetch site {site.id}: {e}")
                
                results.append({
                    "vendor": vendor,
                    "sites_fetched": len(sites),
                    "sites_updated": sites_updated,
                    "status": "success"
                })
                
            except Exception as e:
                logger.error(f"Failed to fetch from {vendor}: {e}")
                results.append({
                    "vendor": vendor,
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "status": "success",
            "message": "Data fetch completed",
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch-vendor/{vendor}")
def fetch_vendor_data(vendor: str, db: Session = Depends(get_db)):
    """
    Manually trigger data fetch from a specific vendor
    """
    try:
        # Get API key for vendor
        api_key = db.query(ApiKey).filter(ApiKey.vendor == vendor).first()
        
        if not api_key:
            raise HTTPException(
                status_code=404, 
                detail=f"No API key found for {vendor}. Please add it in Settings."
            )
        
        data_service = DataService(db)
        key = api_key.key_encrypted
        
        logger.info(f"Fetching sites from {vendor}...")
        sites = data_service.fetch_all_sites(vendor, key)
        
        # Fetch details for first few sites
        sites_updated = 0
        for site in sites[:5]:
            try:
                data_service.fetch_site_overview(site.id, vendor, key)
                data_service.fetch_site_devices(site.id, vendor, key)
                sites_updated += 1
            except Exception as e:
                logger.error(f"Failed to fetch site {site.id}: {e}")
        
        return {
            "status": "success",
            "vendor": vendor,
            "sites_fetched": len(sites),
            "sites_updated": sites_updated
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fetch error for {vendor}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

