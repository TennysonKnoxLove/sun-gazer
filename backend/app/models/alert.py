"""
Alert Model
"""
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, index=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=True)
    vendor = Column(String, nullable=False, index=True)
    
    # Alert Details
    severity = Column(String, nullable=False, index=True)  # Critical, Warning, Info
    code = Column(String, nullable=True)
    description = Column(String, nullable=False)
    status = Column(String, default="Active", index=True)  # Active, Acknowledged, Resolved
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    site = relationship("Site", back_populates="alerts")
    
    def __repr__(self):
        return f"<Alert(id={self.id}, severity={self.severity}, status={self.status})>"

