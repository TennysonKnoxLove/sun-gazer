"""
Partner Authentication Endpoints

For Enphase Partner/Installer applications using password grant flow
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from loguru import logger
from pydantic import BaseModel

from app.core.database import get_db
from app.models import ApiKey
from app.connectors.enphase_oauth import EnphaseOAuth

router = APIRouter()


class EnphasePartnerLogin(BaseModel):
    """Partner login credentials"""
    email: str
    password: str


@router.post("/enphase/partner-login")
def enphase_partner_login(
    credentials: EnphasePartnerLogin,
    db: Session = Depends(get_db)
):
    """
    Partner/Installer Login for Enphase
    
    Uses password grant flow to get access token with Enlighten credentials.
    This is for installers/partners who manage multiple customer systems.
    
    Required: Partner application with at least 10 installations
    """
    oauth = EnphaseOAuth()
    
    try:
        # Get partner token using Enlighten credentials
        token_data = oauth.get_partner_token(
            username=credentials.email,
            password=credentials.password
        )
        
        # Extract token info
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 86400)  # Default 1 day
        app_type = token_data.get("app_type")
        
        # Verify it's a partner app
        if app_type != "partner":
            logger.warning(f"Not a partner app: {app_type}")
            raise HTTPException(
                status_code=403,
                detail="This application is not configured as a Partner app. Partner apps require installer status with 10+ installations."
            )
        
        # Check if Enphase API key already exists
        existing_key = db.query(ApiKey).filter(ApiKey.vendor == "Enphase").first()
        
        if existing_key:
            # Update existing key
            existing_key.key_encrypted = access_token
            existing_key.key_masked = "***********" + access_token[-6:] if len(access_token) > 6 else "***"
            existing_key.last_used = datetime.utcnow()
            # TODO: Store refresh_token and expires_at in separate columns
            logger.info(f"Updated Enphase partner token for {credentials.email}")
        else:
            # Create new API key entry
            api_key = ApiKey(
                id=str(uuid.uuid4()),
                vendor="Enphase",
                key_encrypted=access_token,  # Store access token
                key_masked="***********" + access_token[-6:] if len(access_token) > 6 else "***",
                created=datetime.utcnow(),
                last_used=datetime.utcnow()
            )
            # TODO: Store refresh_token and expires_at
            db.add(api_key)
            logger.info(f"Created new Enphase partner token for {credentials.email}")
        
        db.commit()
        
        return {
            "status": "success",
            "message": "Partner authentication successful!",
            "vendor": "Enphase",
            "app_type": app_type,
            "expires_in_hours": round(expires_in / 3600, 1),
            "note": "You can now fetch data from all customer systems"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Partner login failed: {e}")
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/enphase/refresh")
def refresh_enphase_token(db: Session = Depends(get_db)):
    """
    Refresh an expired Enphase partner access token
    
    Uses the stored refresh token to get a new access token
    """
    # Get existing Enphase API key
    api_key = db.query(ApiKey).filter(ApiKey.vendor == "Enphase").first()
    
    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="No Enphase token found. Please login with partner credentials first."
        )
    
    # TODO: Store and retrieve refresh_token from database
    # For now, user needs to re-login with credentials
    raise HTTPException(
        status_code=501,
        detail="Token refresh not yet implemented. Please use /auth/enphase/partner-login again with your Enlighten credentials."
    )

