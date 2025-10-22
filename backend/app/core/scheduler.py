"""
Background Scheduler for Data Polling
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models import ApiKey
from app.services.data_service import DataService

scheduler = BackgroundScheduler()


def poll_all_sites():
    """Background job to poll data from all vendors"""
    logger.info("🔄 Polling all sites...")
    
    db: Session = SessionLocal()
    
    try:
        # Get all API keys
        api_keys = db.query(ApiKey).all()
        
        if not api_keys:
            logger.warning("No API keys found. Add API keys in Settings.")
            return
        
        data_service = DataService(db)
        
        # Fetch sites for each vendor
        for api_key in api_keys:
            vendor = api_key.vendor
            key = api_key.key_encrypted  # In production, decrypt this
            
            logger.info(f"Fetching sites from {vendor}...")
            
            try:
                sites = data_service.fetch_all_sites(vendor, key)
                logger.info(f"✅ Fetched {len(sites)} sites from {vendor}")
                
                # Fetch details for each site
                for site in sites[:5]:  # Limit to 5 sites to avoid rate limits
                    try:
                        data_service.fetch_site_overview(site.id, vendor, key)
                        data_service.fetch_site_devices(site.id, vendor, key)
                        logger.info(f"✅ Updated data for site {site.name}")
                    except Exception as e:
                        logger.error(f"Failed to fetch site {site.id}: {e}")
                        
            except Exception as e:
                logger.error(f"Failed to fetch from {vendor}: {e}")
        
        logger.info("✅ Polling complete")
        
    except Exception as e:
        logger.error(f"Polling error: {e}")
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler"""
    logger.info("🚀 Starting background scheduler...")
    
    # Add polling job
    scheduler.add_job(
        poll_all_sites,
        trigger=IntervalTrigger(minutes=settings.POLL_INTERVAL_MINUTES),
        id="poll_all_sites",
        name="Poll all solar sites",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("✅ Scheduler started")


def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("⏹️  Scheduler stopped")

