"""
Fetch Log Model - Tracks API call history and status
"""
from sqlalchemy import Column, String, DateTime, Integer
from datetime import datetime

from app.core.database import Base


class FetchLog(Base):
    __tablename__ = "fetch_logs"
    
    id = Column(String, primary_key=True)
    vendor = Column(String, nullable=False, index=True)
    site_id = Column(String, nullable=True, index=True)
    resource = Column(String, nullable=False)  # sites, overview, energy, devices, etc.
    
    # Status
    last_success_at = Column(DateTime, nullable=True)
    last_attempt_at = Column(DateTime, default=datetime.utcnow)
    last_status = Column(String, nullable=True)  # success, error, rate_limited, etc.
    error_message = Column(String, nullable=True)
    
    # Rate Limiting
    cooldown_until = Column(DateTime, nullable=True)
    retry_after = Column(Integer, nullable=True)  # seconds
    
    def __repr__(self):
        return f"<FetchLog(vendor={self.vendor}, resource={self.resource}, status={self.last_status})>"

