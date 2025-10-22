"""
Base Connector Class
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx


class BaseConnector(ABC):
    """Base class for all vendor API connectors"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.Client(timeout=30.0)  # Changed to sync Client
    
    @abstractmethod
    def get_sites(self) -> List[Dict[str, Any]]:
        """Fetch all sites from vendor API"""
        pass
    
    @abstractmethod
    def get_site_details(self, site_id: str) -> Dict[str, Any]:
        """Fetch details for a specific site"""
        pass
    
    @abstractmethod
    def get_site_energy(
        self, 
        site_id: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Fetch energy production data"""
        pass
    
    @abstractmethod
    def get_devices(self, site_id: str) -> List[Dict[str, Any]]:
        """Fetch devices/equipment for a site"""
        pass
    
    def close(self):
        """Close HTTP client"""
        self.client.close()

