"""
API Key Model
"""
from sqlalchemy import Column, String, DateTime
from datetime import datetime

from app.core.database import Base


class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, index=True)
    vendor = Column(String, nullable=False, unique=True, index=True)
    
    # Encrypted key storage
    key_encrypted = Column(String, nullable=False)
    key_masked = Column(String, nullable=False)  # For display: ***********ABCDEF
    
    # Timestamps
    created = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<ApiKey(vendor={self.vendor}, masked={self.key_masked})>"

