"""
Enphase OAuth 2.0 Helper

Handles OAuth flow for Enphase API:
- Generate authorization URL
- Exchange authorization code for access token
- Refresh expired tokens
"""
import httpx
import base64
from typing import Dict, Optional
from loguru import logger
from app.core.config import settings


class EnphaseOAuth:
    """Handle Enphase OAuth 2.0 flow"""
    
    def __init__(self):
        self.client_id = settings.ENPHASE_CLIENT_ID
        self.client_secret = settings.ENPHASE_CLIENT_SECRET
        self.redirect_uri = settings.ENPHASE_REDIRECT_URI
        self.auth_url = settings.ENPHASE_AUTHORIZATION_URL
        self.token_url = settings.ENPHASE_TOKEN_URL
        
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """
        Generate authorization URL for user to approve access
        
        Args:
            state: Optional state parameter for security/tracking
            
        Returns:
            URL to redirect user to for authorization
        """
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri
        }
        
        if state:
            params["state"] = state
            
        # Build URL
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        auth_url = f"{self.auth_url}?{query_string}"
        
        logger.info(f"Generated Enphase authorization URL")
        return auth_url
    
    def _get_basic_auth_header(self) -> str:
        """Generate Basic Auth header from client_id and client_secret"""
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"
    
    def exchange_code_for_token(self, authorization_code: str) -> Dict[str, any]:
        """
        Exchange authorization code for access token
        
        Args:
            authorization_code: Code received from OAuth callback
            
        Returns:
            Dictionary containing access_token, refresh_token, expires_in, etc.
        """
        headers = {
            "Authorization": self._get_basic_auth_header()
        }
        
        data = {
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
            "code": authorization_code
        }
        
        try:
            logger.info("Exchanging authorization code for access token")
            with httpx.Client() as client:
                response = client.post(
                    self.token_url,
                    headers=headers,
                    data=data,
                    timeout=30.0
                )
                response.raise_for_status()
                token_data = response.json()
                
            logger.info("Successfully obtained access token")
            return token_data
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to exchange code for token: {e.response.text}")
            raise Exception(f"Token exchange failed: {e.response.text}")
        except Exception as e:
            logger.error(f"Token exchange error: {e}")
            raise
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, any]:
        """
        Refresh an expired access token using refresh token
        
        Args:
            refresh_token: The refresh token from previous authorization
            
        Returns:
            Dictionary containing new access_token, refresh_token, expires_in, etc.
        """
        headers = {
            "Authorization": self._get_basic_auth_header()
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }
        
        try:
            logger.info("Refreshing access token")
            with httpx.Client() as client:
                response = client.post(
                    self.token_url,
                    headers=headers,
                    data=data,
                    timeout=30.0
                )
                response.raise_for_status()
                token_data = response.json()
                
            logger.info("Successfully refreshed access token")
            return token_data
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to refresh token: {e.response.text}")
            raise Exception(f"Token refresh failed: {e.response.text}")
        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            raise
    
    def get_partner_token(self, username: str, password: str) -> Dict[str, any]:
        """
        Get access token using password grant (for Partner applications only)
        
        Args:
            username: Enlighten email
            password: Enlighten password
            
        Returns:
            Dictionary containing access_token, refresh_token, expires_in, etc.
        """
        headers = {
            "Authorization": self._get_basic_auth_header()
        }
        
        data = {
            "grant_type": "password",
            "username": username,
            "password": password
        }
        
        try:
            logger.info(f"Getting partner token for {username}")
            with httpx.Client() as client:
                response = client.post(
                    self.token_url,
                    headers=headers,
                    data=data,
                    timeout=30.0
                )
                response.raise_for_status()
                token_data = response.json()
                
            logger.info("Successfully obtained partner token")
            return token_data
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to get partner token: {e.response.text}")
            raise Exception(f"Partner token failed: {e.response.text}")
        except Exception as e:
            logger.error(f"Partner token error: {e}")
            raise

