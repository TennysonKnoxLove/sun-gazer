"""
Data Service - Orchestrates data fetching and normalization
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import uuid

from app.models import Site, Device, Alert, TimeseriesMetric
from app.connectors import EnphaseConnector, SolarEdgeConnector, GeneracConnector
from loguru import logger


class DataService:
    """Service for fetching and normalizing vendor data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def fetch_all_sites(self, vendor: str, api_key: str) -> List[Site]:
        """
        Fetch all sites from a vendor and store in database
        
        Args:
            vendor: Vendor name (SolarEdge, Enphase, Generac)
            api_key: API key or account ID (for Generac, use account ID)
        """
        try:
            if vendor == "SolarEdge":
                connector = SolarEdgeConnector(api_key)
                raw_sites = connector.get_sites()
            elif vendor == "Enphase":
                connector = EnphaseConnector(api_key)
                raw_sites = connector.get_sites()
            elif vendor == "Generac":
                connector = GeneracConnector(api_key)  # api_key is account_id for Generac
                raw_sites = connector.get_sites()
            else:
                logger.warning(f"Unsupported vendor: {vendor}")
                return []
            
            sites = []
            for raw_site in raw_sites:
                site = self._normalize_site(raw_site)
                sites.append(site)
                
                # Upsert to database
                existing = self.db.query(Site).filter(Site.id == site.id).first()
                if existing:
                    for key, value in site.__dict__.items():
                        if not key.startswith('_'):
                            setattr(existing, key, value)
                else:
                    self.db.add(site)
            
            self.db.commit()
            connector.close()
            
            logger.info(f"✅ Fetched {len(sites)} sites from {vendor}")
            return sites
            
        except Exception as e:
            logger.error(f"Failed to fetch sites from {vendor}: {e}")
            return []
    
    def fetch_site_overview(self, site_id: str, vendor: str, api_key: str) -> Optional[Site]:
        """
        Fetch site overview and update database
        
        For SolarEdge, we fetch both overview (for energy totals) and 
        power flow (for real-time PV/battery/load data)
        """
        try:
            if vendor == "SolarEdge":
                connector = SolarEdgeConnector(api_key)
                overview = connector.get_site_overview(site_id)
                
                # Get real-time power flow data - this is the KEY to accurate current power
                power_flow = connector.get_power_flow(site_id)
                
                # Use PV power from power flow as the actual current production
                # This is what you see in the monitoring app (panels producing 0.4 kW, etc.)
                overview['current_power_kw'] = power_flow.get('pv_power_kw', overview.get('current_power_kw', 0))
                
            elif vendor == "Enphase":
                connector = EnphaseConnector(api_key)
                # Enphase doesn't have a direct overview endpoint
                overview = {}
            elif vendor == "Generac":
                connector = GeneracConnector(api_key)
                overview = connector.get_site_overview(site_id)
            else:
                return None
            
            # Update site in database
            site = self.db.query(Site).filter(Site.id == site_id).first()
            if site:
                site.current_power_kw = overview.get('current_power_kw', site.current_power_kw)
                site.daily_production_kwh = overview.get('daily_energy_kwh', site.daily_production_kwh)
                site.lifetime_energy_mwh = overview.get('lifetime_energy_mwh', site.lifetime_energy_mwh)
                site.last_updated = datetime.utcnow()
                self.db.commit()
            
            connector.close()
            return site
            
        except Exception as e:
            logger.error(f"Failed to fetch overview for {site_id}: {e}")
            return None
    
    def fetch_site_devices(self, site_id: str, vendor: str, api_key: str) -> List[Device]:
        """
        Fetch devices for a site and update database
        """
        try:
            if vendor == "SolarEdge":
                connector = SolarEdgeConnector(api_key)
                raw_devices = connector.get_devices(site_id)
            elif vendor == "Enphase":
                connector = EnphaseConnector(api_key)
                raw_devices = connector.get_devices(site_id)
            elif vendor == "Generac":
                connector = GeneracConnector(api_key)
                raw_devices = connector.get_devices(site_id)
            else:
                return []
            
            devices = []
            for raw_device in raw_devices:
                device = self._normalize_device(raw_device, site_id, vendor)
                devices.append(device)
                
                # Upsert to database
                existing = self.db.query(Device).filter(Device.id == device.id).first()
                if existing:
                    for key, value in device.__dict__.items():
                        if not key.startswith('_'):
                            setattr(existing, key, value)
                else:
                    self.db.add(device)
            
            self.db.commit()
            connector.close()
            
            logger.info(f"✅ Fetched {len(devices)} devices for site {site_id}")
            return devices
            
        except Exception as e:
            logger.error(f"Failed to fetch devices for {site_id}: {e}")
            return []
    
    def _normalize_site(self, raw_site: Dict[str, Any]) -> Site:
        """Normalize vendor site data to our schema"""
        return Site(
            id=raw_site.get('id', str(uuid.uuid4())),
            vendor=raw_site.get('vendor', 'Unknown'),
            vendor_site_id=raw_site.get('vendor_site_id', ''),
            name=raw_site.get('name', 'Unknown Site'),
            status=raw_site.get('status', 'Unknown'),
            peak_power_kw=raw_site.get('peak_power_kw', 0.0),
            current_power_kw=raw_site.get('current_power_kw', 0.0),
            daily_production_kwh=raw_site.get('daily_production_kwh', 0.0),
            health_score=raw_site.get('health_score', 100),
            address_json=raw_site.get('address', {}),
            latitude=raw_site.get('latitude'),
            longitude=raw_site.get('longitude'),
            last_updated=datetime.utcnow()
        )
    
    def _normalize_device(self, raw_device: Dict[str, Any], site_id: str, vendor: str) -> Device:
        """Normalize vendor device data to our schema"""
        return Device(
            id=raw_device.get('id', str(uuid.uuid4())),
            site_id=site_id,
            vendor=vendor,
            vendor_device_id=raw_device.get('vendor_device_id', ''),
            device_type=raw_device.get('device_type', 'unknown'),
            model=raw_device.get('model'),
            manufacturer=raw_device.get('manufacturer'),
            serial_number=raw_device.get('serial_number'),
            status=raw_device.get('status', 'Unknown'),
            last_reported=datetime.utcnow()
        )

