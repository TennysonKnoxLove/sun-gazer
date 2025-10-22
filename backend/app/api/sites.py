"""
Sites API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models import Site, Device, TimeseriesMetric, Alert
from app.services.data_service import DataService

router = APIRouter()


@router.get("")
def get_all_sites(
    vendor: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get all sites with optional filtering and pagination"""
    query = db.query(Site)
    
    if vendor:
        query = query.filter(Site.vendor == vendor)
    if status:
        query = query.filter(Site.status == status)
    
    # Get total count before pagination
    total_count = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    sites = query.offset(offset).limit(page_size).all()
    
    # Calculate pagination metadata
    total_pages = (total_count + page_size - 1) // page_size  # Ceiling division
    
    return {
        "sites": [
            {
                "id": site.id,
                "name": site.name,
                "vendor": site.vendor,
                "vendor_site_id": site.vendor_site_id,
                "status": site.status,
                "peak_power_kw": site.peak_power_kw,
                "current_power_kw": site.current_power_kw,
                "daily_production_kwh": site.daily_production_kwh,
                "health_score": site.health_score,
                "address": site.address_json,
                "last_updated": site.last_updated.isoformat() if site.last_updated else None
            }
            for site in sites
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


@router.get("/{site_id}")
def get_site_by_id(site_id: str, db: Session = Depends(get_db)):
    """Get specific site by ID"""
    site = db.query(Site).filter(Site.id == site_id).first()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    return {
        "id": site.id,
        "name": site.name,
        "vendor": site.vendor,
        "vendor_site_id": site.vendor_site_id,
        "status": site.status,
        "peak_power_kw": site.peak_power_kw,
        "current_power_kw": site.current_power_kw,
        "daily_production_kwh": site.daily_production_kwh,
        "lifetime_energy_mwh": site.lifetime_energy_mwh,
        "health_score": site.health_score,
        "address": site.address_json,
        "latitude": site.latitude,
        "longitude": site.longitude,
        "last_updated": site.last_updated.isoformat() if site.last_updated else None
    }


@router.get("/{site_id}/overview")
def get_site_overview(site_id: str, db: Session = Depends(get_db)):
    """Get site overview with current metrics"""
    site = db.query(Site).filter(Site.id == site_id).first()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Get device counts
    total_devices = db.query(Device).filter(Device.site_id == site_id).count()
    online_devices = db.query(Device).filter(
        Device.site_id == site_id, 
        Device.status == "Online"
    ).count()
    
    return {
        "site_id": site.id,
        "name": site.name,
        "status": site.status,
        "current_power_kw": site.current_power_kw,
        "daily_production_kwh": site.daily_production_kwh,
        "health_score": site.health_score,
        "total_devices": total_devices,
        "online_devices": online_devices,
        "last_updated": site.last_updated.isoformat() if site.last_updated else None
    }


@router.get("/{site_id}/energy")
def get_site_energy(
    site_id: str,
    period: str = Query("day", regex="^(hour|day|week|month)$"),
    db: Session = Depends(get_db)
):
    """Get energy production data for a site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Calculate time range based on period
    end_time = datetime.utcnow()
    if period == "hour":
        start_time = end_time - timedelta(hours=24)
    elif period == "day":
        start_time = end_time - timedelta(days=7)
    elif period == "week":
        start_time = end_time - timedelta(weeks=4)
    else:  # month
        start_time = end_time - timedelta(days=365)
    
    # Fetch metrics
    metrics = db.query(TimeseriesMetric).filter(
        TimeseriesMetric.site_id == site_id,
        TimeseriesMetric.metric_name == "energy",
        TimeseriesMetric.timestamp >= start_time,
        TimeseriesMetric.timestamp <= end_time
    ).order_by(TimeseriesMetric.timestamp).all()
    
    return [
        {
            "timestamp": metric.timestamp.isoformat(),
            "value": metric.value,
            "metric_name": metric.metric_name
        }
        for metric in metrics
    ]


@router.get("/{site_id}/devices")
def get_site_devices(site_id: str, db: Session = Depends(get_db)):
    """Get all devices for a site"""
    devices = db.query(Device).filter(Device.site_id == site_id).all()
    
    return [
        {
            "id": device.id,
            "site_id": device.site_id,
            "vendor": device.vendor,
            "vendor_device_id": device.vendor_device_id,
            "device_type": device.device_type,
            "model": device.model,
            "manufacturer": device.manufacturer,
            "serial_number": device.serial_number,
            "status": device.status,
            "last_reported": device.last_reported.isoformat() if device.last_reported else None
        }
        for device in devices
    ]


@router.get("/{site_id}/layout")
def get_site_layout(site_id: str, db: Session = Depends(get_db)):
    """Get panel layout for schematic view"""
    devices = db.query(Device).filter(
        Device.site_id == site_id,
        Device.device_type.in_(["panel", "microinverter"])
    ).order_by(Device.serial_number).all()
    
    return [
        {
            "id": device.id,
            "serial_number": device.serial_number,
            "device_type": device.device_type,
            "status": device.status
        }
        for device in devices
    ]


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


@router.post("/{site_id}/refresh")
def refresh_site(
    site_id: str, 
    resource: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Trigger manual refresh for a specific site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # TODO: Implement site refresh logic based on resource
    # resource can be: overview, energy, devices, alerts, etc.
    
    return {
        "status": "refresh_triggered",
        "site_id": site_id,
        "resource": resource or "all"
    }

