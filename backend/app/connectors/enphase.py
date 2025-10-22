"""
Enphase API Connector

Based on Enphase API v4
Documentation: https://api.enphaseenergy.com/api/v4
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import httpx
from loguru import logger

from app.connectors.base import BaseConnector
from app.core.config import settings


class EnphaseConnector(BaseConnector):
    """
    Enphase API Connector
    
    Requires OAuth 2.0 authentication:
    - Authorization: Bearer {access_token} (OAuth token from user authorization)
    - key: {app_api_key} (Application API key from developer portal)
    
    The api_key parameter should contain the OAuth access_token
    """
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.base_url = settings.ENPHASE_BASE_URL
        # The api_key parameter contains the OAuth access token
        self.access_token = api_key
        # Application API key from developer portal (goes in 'key' header)
        self.app_api_key = settings.ENPHASE_DEV_API_KEY
    
    def _make_request(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make API request with OAuth token and API key
        
        Enphase API requires:
        - Authorization: Bearer {access_token} (in header)
        - key: {application_api_key} (in query params)
        """
        if params is None:
            params = {}
        
        # Add application API key to query params
        params["key"] = self.app_api_key
        
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        
        try:
            logger.info(f"Enphase API request: {endpoint}")
            response = self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            return response.json()
        
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.error(f"Enphase unauthorized: {e}")
                raise Exception("Invalid or expired token")
            elif e.response.status_code == 429:
                logger.warning(f"Enphase rate limit exceeded: {e}")
                raise Exception("Rate limit exceeded")
            else:
                logger.error(f"Enphase HTTP error: {e}")
                raise
        
        except Exception as e:
            logger.error(f"Enphase request failed: {e}")
            raise
    
    def get_systems(self) -> List[Dict[str, Any]]:
        """
        Fetch all systems
        
        Endpoint: GET /api/v4/systems
        Returns paginated list of systems
        """
        all_systems = []
        page = 1
        page_size = 100  # Max allowed
        
        while True:
            data = self._make_request("/systems", params={"page": page, "size": page_size})
            
            systems = data.get("systems", [])
            if not systems:
                break
                
            all_systems.extend(systems)
            
            # Check if there are more pages
            total = data.get("total", 0)
            if len(all_systems) >= total:
                break
                
            page += 1
        
        return [
            {
                "id": f"en_{system['system_id']}",
                "vendor": "Enphase",
                "vendor_site_id": str(system["system_id"]),
                "name": system.get("name", "Unknown System"),
                "status": self._map_status(system.get("status")),
                "address": {
                    "street": None,  # Not provided in list endpoint
                    "city": system.get("address", {}).get("city"),
                    "state": system.get("address", {}).get("state"),
                    "zip": system.get("address", {}).get("postal_code"),
                    "country": system.get("address", {}).get("country"),
                }
            }
            for system in all_systems
        ]
    
    def get_sites(self) -> List[Dict[str, Any]]:
        """Alias for get_systems"""
        return self.get_systems()
    
    def get_site_details(self, site_id: str) -> Dict[str, Any]:
        """
        Fetch system details and summary
        
        Endpoint: GET /api/v4/systems/{system_id}
        Endpoint: GET /api/v4/systems/{system_id}/summary
        """
        system_id = site_id.replace("en_", "")
        
        # Get basic system info
        system_data = self._make_request(f"/systems/{system_id}")
        
        # Get summary with current production data
        try:
            summary_data = self._make_request(f"/systems/{system_id}/summary")
        except Exception as e:
            logger.warning(f"Could not fetch system summary: {e}")
            summary_data = {}
        
        return {
            "name": system_data.get("name"),
            "status": self._map_status(system_data.get("status")),
            "installation_date": system_data.get("operational_at"),
            "current_power_kw": summary_data.get("current_power", 0) / 1000,  # Convert W to kW
            "daily_production_kwh": summary_data.get("energy_today", 0) / 1000,  # Convert Wh to kWh
            "lifetime_energy_mwh": summary_data.get("energy_lifetime", 0) / 1000000,  # Convert Wh to MWh
            "system_size_kw": summary_data.get("size_w", 0) / 1000,  # Convert W to kW
            "modules_count": summary_data.get("modules", 0),
            "address": {
                "street": None,
                "city": system_data.get("address", {}).get("city"),
                "state": system_data.get("address", {}).get("state"),
                "zip": system_data.get("address", {}).get("postal_code"),
                "country": system_data.get("address", {}).get("country"),
            }
        }
    
    def get_production_mode(self, site_id: str) -> Dict[str, Any]:
        """
        Get system production info
        
        Endpoint: GET /activations/{activation_id}/ops/production_mode
        """
        activation_id = site_id.replace("en_", "")
        
        data = self._make_request(f"/activations/{activation_id}/ops/production_mode")
        
        return {
            "mode": data.get("mode"),
            "total_micros": data.get("total_micros"),
            "energy_producing_micros": data.get("energy_producing_micros"),
        }
    
    def get_site_energy(
        self, 
        site_id: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Fetch energy production data via telemetry
        
        Note: Enphase uses different endpoints for energy data
        Endpoint: GET /systems/{system_id}/telemetry/production_micro
        """
        system_id = site_id.replace("en_", "")
        
        params = {
            "start_at": int(start_date.timestamp()),
            "end_at": int(end_date.timestamp()),
            "granularity": "day"
        }
        
        # This is a simplified version - actual endpoint may vary
        try:
            data = self._make_request(
                f"/systems/{system_id}/telemetry/production_micro",
                params
            )
            
            intervals = data.get("intervals", [])
            
            return [
                {
                    "timestamp": datetime.fromtimestamp(interval["end_at"]).isoformat(),
                    "value": interval.get("powr", 0) / 1000,  # Convert W to kW
                    "unit": "kWh"
                }
                for interval in intervals
            ]
        except Exception as e:
            logger.warning(f"Could not fetch Enphase energy data: {e}")
            return []
    
    def get_devices(self, site_id: str) -> List[Dict[str, Any]]:
        """
        Fetch devices (microinverters, meters, gateways, etc.)
        
        Endpoint: GET /api/v4/systems/{system_id}/devices
        """
        system_id = site_id.replace("en_", "")
        
        try:
            data = self._make_request(f"/systems/{system_id}/devices")
            
            devices = []
            device_data = data.get("devices", {})
            
            # Process microinverters
            for micro in device_data.get("micros", []):
                devices.append({
                    "id": f"en_micro_{micro['serial_number']}",
                    "vendor_device_id": micro["serial_number"],
                    "device_type": "microinverter",
                    "model": micro.get("model", "Unknown"),
                    "manufacturer": "Enphase",
                    "serial_number": micro["serial_number"],
                    "status": self._map_device_status(micro.get("status"))
                })
            
            # Process meters
            for meter in device_data.get("meters", []):
                devices.append({
                    "id": f"en_meter_{meter['serial_number']}",
                    "vendor_device_id": meter["serial_number"],
                    "device_type": "meter",
                    "model": meter.get("model", "Unknown"),
                    "manufacturer": "Enphase",
                    "serial_number": meter["serial_number"],
                    "status": self._map_device_status(meter.get("status"))
                })
            
            # Process gateways (Envoy)
            for gateway in device_data.get("gateways", []):
                devices.append({
                    "id": f"en_gateway_{gateway['serial_number']}",
                    "vendor_device_id": gateway["serial_number"],
                    "device_type": "gateway",
                    "model": gateway.get("model", "Envoy"),
                    "manufacturer": "Enphase",
                    "serial_number": gateway["serial_number"],
                    "status": self._map_device_status(gateway.get("status"))
                })
            
            # Process batteries (Encharge)
            for battery in device_data.get("encharges", []):
                devices.append({
                    "id": f"en_battery_{battery['serial_number']}",
                    "vendor_device_id": battery["serial_number"],
                    "device_type": "battery",
                    "model": battery.get("model", "IQ Battery"),
                    "manufacturer": "Enphase",
                    "serial_number": battery["serial_number"],
                    "status": self._map_device_status(battery.get("status"))
                })
            
            return devices
        
        except Exception as e:
            logger.warning(f"Could not fetch Enphase devices: {e}")
            return []
    
    def get_meters(self, site_id: str) -> List[Dict[str, Any]]:
        """
        Fetch meters
        
        Endpoint: GET /systems/{system_id}/meters
        """
        system_id = site_id.replace("en_", "")
        
        try:
            # Note: This endpoint structure is simplified
            data = self._make_request(f"/systems/{system_id}/meters")
            
            meters = []
            for meter in data.get("meters", []):
                meters.append({
                    "id": f"en_meter_{meter['serial_number']}",
                    "vendor_device_id": meter["serial_number"],
                    "device_type": "meter",
                    "model": meter.get("model"),
                    "manufacturer": "Enphase",
                    "serial_number": meter["serial_number"],
                    "status": self._map_meter_status(meter.get("status"))
                })
            
            return meters
        
        except Exception as e:
            logger.warning(f"Could not fetch Enphase meters: {e}")
            return []
    
    def _map_status(self, status: str) -> str:
        """Map Enphase system status to our unified status"""
        status_map = {
            "normal": "Online",
            "comm": "Warning",  # Envoy Not Reporting
            "micro": "Warning",  # Microinverters Not Reporting
            "power": "Warning",  # System Production Issue
            "meter_issue": "Warning",
            "storage_idle": "Online",
            "warning": "Warning",
            "error": "Offline",
            "no_data": "Offline",
            "on_grid": "Online",
            "off_grid": "Offline",
            "unknown": "Warning",
        }
        return status_map.get(status, "Warning")
    
    def _map_device_status(self, status: str) -> str:
        """Map Enphase device status to our unified status"""
        status_map = {
            "normal": "Online",
            "comm": "Offline",
            "micro": "Warning",
            "power": "Warning",
            "error": "Offline",
            "warning": "Warning",
            "unknown": "Warning",
        }
        return status_map.get(status, "Warning")

