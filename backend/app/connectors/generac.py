"""
Generac PWRfleet API Connector

Official API with OAuth 2.0 authentication.
API Base: https://generac-api.neur.io
Portal: https://pwrfleet.generac.com
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import httpx
from loguru import logger
import time
import json
import base64

from app.connectors.base import BaseConnector


class GeneracConnector(BaseConnector):
    """
    Generac PWRfleet API Connector (Official API)
    
    API Base: https://generac-api.neur.io/
    Portal: https://pwrfleet.generac.com
    
    Authentication:
    - OAuth 2.0 with PKCE flow
    - Requires Bearer token (access token)
    - Supports token refresh
    
    Rate Limits:
    - CONSERVATIVE: Recommend max 4-6 calls per day
    - Data may be delayed by 45 minutes to hours
    
    Security:
    - Uses OAuth 2.0 tokens - NO public dashboard required
    - Each user authenticates with their own account
    """
    
    def __init__(self, credentials: str):
        """
        Initialize Generac connector
        
        Args:
            credentials: Base64-encoded JSON with OAuth tokens:
                {
                    "user_id": "...",
                    "access_token": "...",
                    "refresh_token": "...",
                    "expires_in": 3600,
                    "token_type": "Bearer",
                    "created_at": "2025-10-22T..."
                }
        """
        super().__init__(credentials)
        self.api_base_url = "https://generac-api.neur.io"
        self.last_request_time = 0
        self.min_request_interval = 10  # Minimum 10 seconds between requests
        
        # Parse OAuth credentials from base64-encoded JSON
        try:
            decoded = base64.b64decode(credentials).decode('utf-8')
            oauth_data = json.loads(decoded)
            
            # Note: user_id is the fleet/company ID used in API URLs
            self.fleet_id = oauth_data.get('user_id')  # This is actually the fleet/company ID
            self.access_token = oauth_data.get('access_token')
            self.refresh_token = oauth_data.get('refresh_token')
            self.expires_in = oauth_data.get('expires_in')
            self.token_type = oauth_data.get('token_type', 'Bearer')
            self.created_at = oauth_data.get('created_at')
            
            logger.info(f"✅ Generac OAuth credentials parsed")
            logger.info(f"   Fleet ID: {self.fleet_id}")
            logger.info(f"   Has Access Token: {'✅' if self.access_token else '❌'}")
            logger.info(f"   Has Refresh Token: {'✅' if self.refresh_token else '❌'}")
            if self.expires_in:
                logger.info(f"   Expires In: {self.expires_in}s")
            
            if not self.fleet_id or not self.access_token:
                raise ValueError("Missing required OAuth credentials (fleet_id or access_token)")
                
        except Exception as e:
            logger.error(f"❌ Failed to parse Generac OAuth credentials: {e}")
            raise ValueError(f"Invalid Generac credentials format: {e}")
    
    def _make_request(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make authenticated API request with rate limiting"""
        # Enforce rate limiting
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last_request
            logger.info(f"⏱️ Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        url = f"{self.api_base_url}{endpoint}"
        
        # Build headers with OAuth Bearer token
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            logger.info(f"📤 GET {url}")
            if params:
                logger.debug(f"   Params: {params}")
            
            response = self.client.get(url, params=params, headers=headers, timeout=30.0)
            response.raise_for_status()
            self.last_request_time = time.time()
            
            logger.info(f"📥 Response Status: {response.status_code}")
            return response.json()
        
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.error(f"❌ Authentication failed - token may be expired")
                raise Exception("Authentication failed. Token may be expired - please refresh your tokens.")
            elif e.response.status_code == 403:
                logger.error(f"❌ Access forbidden")
                raise Exception("Access denied. Your account may not have permission to access this data.")
            elif e.response.status_code == 429:
                logger.error(f"❌ Rate limit exceeded")
                raise Exception("Rate limit exceeded - please try again later")
            else:
                logger.error(f"❌ HTTP error: {e.response.status_code}")
                raise
        
        except Exception as e:
            logger.error(f"❌ Request failed: {e}")
            raise
    
    def get_sites(self) -> List[Dict[str, Any]]:
        """
        Fetch all sites from the fleet
        
        Endpoint: GET /fleets/v4/{fleetId}/sites/paginated
        """
        logger.info(f"🔍 Fetching sites for fleet {self.fleet_id}")
        
        # Fetch first page to see how many sites there are
        endpoint = f"/fleets/v4/{self.fleet_id}/sites/paginated"
        params = {
            'sort': 'installedDate:DESC',
            'perPage': 100,  # Get more sites per page
            'page': 1
        }
        
        response_data = self._make_request(endpoint, params)
        
        sites = []
        # Response has 'data' array, not 'sites'
        if 'data' in response_data:
            logger.info(f"   Total sites available: {response_data.get('total', 'unknown')}")
            for raw_site in response_data['data']:
                site = self._normalize_site(raw_site)
                sites.append(site)
        
        logger.info(f"✅ Found {len(sites)} Generac sites")
        return sites
    
    def _normalize_site(self, raw_site: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize Generac site data to standard format"""
        site_id = raw_site.get('siteId', '')
        site_address = raw_site.get('siteAddress', {})
        
        return {
            "id": f"gen_{site_id}",
            "vendor": "Generac",
            "vendor_site_id": str(site_id),
            "name": raw_site.get('siteName', f"Generac Site {site_id}"),
            "status": self._map_status(raw_site.get('status', 'unknown')),
            "peak_power_kw": raw_site.get('installedPV', 0),  # Already in kW
            "address": {
                "street": site_address.get('streetAddress'),
                "city": site_address.get('city'),
                "state": site_address.get('state'),
                "zip": site_address.get('zip'),
                "country": site_address.get('country', 'US')
            },
            "latitude": site_address.get('latitude'),
            "longitude": site_address.get('longitude'),
        }
    
    def get_site_details(self, site_id: str) -> Dict[str, Any]:
        """
        Fetch detailed site information
        
        Endpoint: GET /fleets/v4/{userId}/sites/{siteId}
        """
        # Extract numeric site ID
        numeric_site_id = site_id.replace('gen_', '')
        
        endpoint = f"/fleets/v4/{self.user_id}/sites/{numeric_site_id}"
        data = self._make_request(endpoint)
        
        return self._normalize_site(data)
    
    def get_site_overview(self, site_id: str) -> Dict[str, Any]:
        """
        Fetch site overview with current metrics
        
        Endpoint: GET /fleets/v4/{userId}/sites/{siteId}/overview
        or similar - we'll need to discover the exact endpoint
        """
        numeric_site_id = site_id.replace('gen_', '')
        
        # Try common overview endpoint patterns
        try:
            endpoint = f"/fleets/v4/{self.user_id}/sites/{numeric_site_id}/overview"
            data = self._make_request(endpoint)
        except:
            # Fallback to site details
            logger.warning("Overview endpoint not found, using site details")
            data = self.get_site_details(site_id)
        
        return {
            "current_power_kw": data.get('currentPower', 0) / 1000 if data.get('currentPower') else 0,
            "daily_energy_kwh": data.get('dailyEnergy', 0) / 1000 if data.get('dailyEnergy') else 0,
            "last_update": datetime.utcnow().isoformat()
        }
    
    def get_devices(self, site_id: str) -> List[Dict[str, Any]]:
        """
        Fetch equipment/devices for a site
        
        Endpoint: GET /fleets/v4/{userId}/sites/{siteId}/devices
        """
        numeric_site_id = site_id.replace('gen_', '')
        
        endpoint = f"/fleets/v4/{self.user_id}/sites/{numeric_site_id}/devices"
        
        try:
            data = self._make_request(endpoint)
        except:
            logger.warning("Devices endpoint not available")
            return []
        
        devices = []
        if 'devices' in data:
            for device in data['devices']:
                devices.append({
                    "id": f"gen_device_{device.get('id', '')}",
                    "vendor_device_id": str(device.get('id', '')),
                    "device_type": device.get('type', 'unknown'),
                    "model": device.get('model', 'Unknown'),
                    "manufacturer": "Generac",
                    "serial_number": device.get('serialNumber', ''),
                    "status": self._map_status(device.get('status', 'unknown'))
                })
        
        return devices
    
    def get_site_energy(
        self, 
        site_id: str, 
        start_date: datetime, 
        end_date: datetime,
        time_unit: str = "DAY"
    ) -> List[Dict[str, Any]]:
        """
        Fetch energy production data
        
        Endpoint: GET /fleets/v4/{userId}/sites/{siteId}/energy
        """
        numeric_site_id = site_id.replace('gen_', '')
        
        endpoint = f"/fleets/v4/{self.user_id}/sites/{numeric_site_id}/energy"
        params = {
            'startDate': start_date.isoformat(),
            'endDate': end_date.isoformat(),
            'timeUnit': time_unit
        }
        
        try:
            data = self._make_request(endpoint, params)
        except:
            logger.warning("Energy endpoint not available")
            return []
        
        energy_data = []
        if 'data' in data:
            for reading in data['data']:
                energy_data.append({
                    "timestamp": reading.get('timestamp'),
                    "value": reading.get('energy', 0) / 1000,  # Convert Wh to kWh
                    "unit": "kWh"
                })
        
        return energy_data
    
    def _map_status(self, status: str) -> str:
        """Map Generac status to unified status"""
        if not status:
            return "Unknown"
        
        status_lower = status.lower()
        if status_lower in ["online", "active", "normal"]:
            return "Online"
        elif status_lower in ["offline", "inactive"]:
            return "Offline"
        elif status_lower in ["warning", "degraded"]:
            return "Warning"
        elif status_lower in ["error", "fault"]:
            return "Error"
        else:
            return "Unknown"
