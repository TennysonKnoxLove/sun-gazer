"""
Dashboard API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import Site, Alert

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics
    
    Returns:
    - total_sites
    - online_sites  
    - sites_with_alerts
    - total_production_today_kwh
    - change_from_yesterday
    - uptime_percentage
    - new_alerts_this_week
    """
    # Total sites
    total_sites = db.query(Site).count()
    
    # Online sites
    online_sites = db.query(Site).filter(Site.status == "Online").count()
    
    # Sites with active alerts
    sites_with_alerts = db.query(func.count(func.distinct(Alert.site_id)))\
        .filter(Alert.status == "Active").scalar() or 0
    
    # Total production today
    total_production_today = db.query(func.sum(Site.daily_production_kwh)).scalar() or 0
    
    # Calculate uptime percentage
    uptime_percentage = round((online_sites / total_sites * 100) if total_sites > 0 else 100, 1)
    
    # New alerts this week (simplified - count all active)
    new_alerts_this_week = db.query(Alert).filter(Alert.status == "Active").count()
    
    return {
        "total_sites": total_sites,
        "online_sites": online_sites,
        "sites_with_alerts": sites_with_alerts,
        "total_production_today_kwh": round(total_production_today, 2),
        "change_from_yesterday": 15.0,  # TODO: Calculate from historical data
        "uptime_percentage": uptime_percentage,
        "new_alerts_this_week": new_alerts_this_week
    }


@router.post("/refresh")
def refresh_dashboard(db: Session = Depends(get_db)):
    """
    Trigger manual refresh of all dashboard data
    """
    # TODO: Implement dashboard refresh logic
    # This would trigger fetch from all vendors
    return {"status": "refresh_triggered", "message": "Dashboard refresh initiated"}

