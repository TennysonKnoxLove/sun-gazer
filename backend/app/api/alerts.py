"""
Alerts API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models import Alert, Site

router = APIRouter()


@router.get("")
def get_all_alerts(
    vendor: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all alerts with optional filtering"""
    query = db.query(Alert).join(Site, Alert.site_id == Site.id)
    
    if vendor:
        query = query.filter(Alert.vendor == vendor)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    
    alerts = query.order_by(Alert.timestamp.desc()).all()
    
    result = []
    for alert in alerts:
        site = db.query(Site).filter(Site.id == alert.site_id).first()
        result.append({
            "id": alert.id,
            "site_id": alert.site_id,
            "site_name": site.name if site else "Unknown",
            "device_id": alert.device_id,
            "vendor": alert.vendor,
            "severity": alert.severity,
            "code": alert.code,
            "description": alert.description,
            "status": alert.status,
            "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
            "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
        })
    
    return result


@router.get("/{site_id}/alerts")
def get_site_alerts(site_id: str, db: Session = Depends(get_db)):
    """Get all alerts for a specific site"""
    alerts = db.query(Alert).filter(Alert.site_id == site_id)\
        .order_by(Alert.timestamp.desc()).all()
    
    return [
        {
            "id": alert.id,
            "site_id": alert.site_id,
            "device_id": alert.device_id,
            "vendor": alert.vendor,
            "severity": alert.severity,
            "code": alert.code,
            "description": alert.description,
            "status": alert.status,
            "timestamp": alert.timestamp.isoformat() if alert.timestamp else None
        }
        for alert in alerts
    ]


@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, db: Session = Depends(get_db)):
    """Mark an alert as acknowledged"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "Acknowledged"
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    
    return {"status": "success", "alert_id": alert_id}


@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    """Mark an alert as resolved"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "Resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    
    return {"status": "success", "alert_id": alert_id}

