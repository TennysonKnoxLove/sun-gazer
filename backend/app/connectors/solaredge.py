"""
SolarEdge API Connector

Based on SolarEdge Monitoring Server API
Documentation: https://monitoringapi.solaredge.com
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import httpx
from loguru import logger

from app.connectors.base import BaseConnector
from app.core.config import settings


class SolarEdgeConnector(BaseConnector):
    """
    SolarEdge API Connector
    
    Rate Limits:
    - 300 requests/day per account
    - 300 requests/day per site
    - 3 concurrent calls per IP
    """
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.base_url = settings.SOLAREDGE_BASE_URL
        self.daily_limit = settings.SOLAREDGE_DAILY_LIMIT
        self.concurrent_limit = settings.SOLAREDGE_CONCURRENT_LIMIT
        self.request_count = 0
    
    def _make_request(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make API request with rate limiting"""
        if params is None:
            params = {}
        
        params["api_key"] = self.api_key
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            logger.info(f"SolarEdge API request: {endpoint}")
            response = self.client.get(url, params=params)
            response.raise_for_status()
            self.request_count += 1
            
            return response.json()
        
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                logger.warning(f"SolarEdge rate limit exceeded: {e}")
                raise Exception("Rate limit exceeded")
            elif e.response.status_code == 403:
                logger.error(f"SolarEdge forbidden: {e}")
                raise Exception("Invalid API key or permissions")
            else:
                logger.error(f"SolarEdge HTTP error: {e}")
                raise
        
        except Exception as e:
            logger.error(f"SolarEdge request failed: {e}")
            raise
    
    def get_sites(self) -> List[Dict[str, Any]]:
        """
        Fetch all sites
        
        Endpoint: GET /sites/list
        """
        data = self._make_request("/sites/list", {"size": 100})
        
        sites_data = data.get("sites", {}).get("site", [])
        
        return [
            {
                "id": f"se_{site['id']}",
                "vendor": "SolarEdge",
                "vendor_site_id": str(site["id"]),
                "name": site.get("name", "Unknown Site"),
                "status": self._map_status(site.get("status")),
                "peak_power_kw": site.get("peakPower", 0) / 1000,  # Convert W to kW
                "address": {
                    "street": site.get("location", {}).get("address"),
                    "city": site.get("location", {}).get("city"),
                    "state": site.get("location", {}).get("state"),
                    "zip": site.get("location", {}).get("zip"),
                    "country": site.get("location", {}).get("country")
                },
                "latitude": site.get("location", {}).get("latitude"),
                "longitude": site.get("location", {}).get("longitude"),
            }
            for site in sites_data
        ]
    
    def get_site_details(self, site_id: str) -> Dict[str, Any]:
        """
        Fetch site details
        
        Endpoint: GET /site/{siteId}/details
        """
        # Remove 'se_' prefix if present
        vendor_site_id = site_id.replace("se_", "")
        
        data = self._make_request(f"/site/{vendor_site_id}/details")
        details = data.get("details", {})
        
        return {
            "name": details.get("name"),
            "status": self._map_status(details.get("status")),
            "peak_power_kw": details.get("peakPower", 0) / 1000,
            "installation_date": details.get("installationDate"),
            "address": {
                "street": details.get("location", {}).get("address"),
                "city": details.get("location", {}).get("city"),
                "state": details.get("location", {}).get("state"),
                "zip": details.get("location", {}).get("zip"),
                "country": details.get("location", {}).get("country"),
            }
        }
    
    def get_site_overview(self, site_id: str) -> Dict[str, Any]:
        """
        Fetch site overview with current metrics
        
        Endpoint: GET /site/{siteId}/overview
        """
        vendor_site_id = site_id.replace("se_", "")
        
        data = self._make_request(f"/site/{vendor_site_id}/overview")
        overview = data.get("overview", {})
        
        return {
            "current_power_kw": overview.get("currentPower", {}).get("power", 0) / 1000,
            "daily_energy_kwh": overview.get("lastDayData", {}).get("energy", 0) / 1000,
            "monthly_energy_kwh": overview.get("lastMonthData", {}).get("energy", 0) / 1000,
            "yearly_energy_kwh": overview.get("lastYearData", {}).get("energy", 0) / 1000,
            "lifetime_energy_mwh": overview.get("lifeTimeData", {}).get("energy", 0) / 1000000,
            "last_update": overview.get("lastUpdateTime"),
        }
    
    def get_site_energy(
        self, 
        site_id: str, 
        start_date: datetime, 
        end_date: datetime,
        time_unit: str = "DAY"
    ) -> List[Dict[str, Any]]:
        """
        Fetch energy production data
        
        Endpoint: GET /site/{siteId}/energy
        Time units: QUARTER_OF_AN_HOUR, HOUR, DAY, WEEK, MONTH, YEAR
        """
        vendor_site_id = site_id.replace("se_", "")
        
        params = {
            "startDate": start_date.strftime("%Y-%m-%d"),
            "endDate": end_date.strftime("%Y-%m-%d"),
            "timeUnit": time_unit
        }
        
        data = self._make_request(f"/site/{vendor_site_id}/energy", params)
        energy_data = data.get("energy", {})
        
        return [
            {
                "timestamp": value.get("date"),
                "value": value.get("value", 0) / 1000,  # Convert Wh to kWh
                "unit": "kWh"
            }
            for value in energy_data.get("values", [])
            if value.get("value") is not None
        ]
    
    def get_devices(self, site_id: str) -> List[Dict[str, Any]]:
        """
        Fetch equipment/devices
        
        Endpoint: GET /site/{siteId}/inventory
        """
        vendor_site_id = site_id.replace("se_", "")
        
        data = self._make_request(f"/site/{vendor_site_id}/inventory")
        inventory = data.get("Inventory", {})
        
        devices = []
        
        # Process inverters
        for inverter in inventory.get("inverters", []):
            devices.append({
                "id": f"se_inv_{inverter['SN']}",
                "vendor_device_id": inverter["SN"],
                "device_type": "inverter",
                "model": inverter.get("model"),
                "manufacturer": inverter.get("manufacturer", "SolarEdge"),
                "serial_number": inverter["SN"],
                "status": "Online"  # SolarEdge doesn't provide real-time status in inventory
            })
        
        # Process meters
        for meter in inventory.get("meters", []):
            devices.append({
                "id": f"se_meter_{meter['serialNumber']}",
                "vendor_device_id": meter["serialNumber"],
                "device_type": "meter",
                "model": meter.get("model"),
                "manufacturer": meter.get("manufacturer", "SolarEdge"),
                "serial_number": meter["serialNumber"],
                "status": "Online"
            })
        
        # Process batteries
        for battery in inventory.get("batteries", []):
            devices.append({
                "id": f"se_battery_{battery['serialNumber']}",
                "vendor_device_id": battery["serialNumber"],
                "device_type": "battery",
                "model": battery.get("model"),
                "manufacturer": battery.get("manufacturer", "SolarEdge"),
                "serial_number": battery["serialNumber"],
                "status": "Online"
            })
        
        return devices
    
    def _map_status(self, status: str) -> str:
        """Map SolarEdge status to our unified status"""
        status_map = {
            "Active": "Online",
            "Pending": "Offline",
            "PendingCommunication": "Offline",
            "Disabled": "Maintenance"
        }
        return status_map.get(status, "Unknown")

