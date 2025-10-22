"""
Device Model
"""
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Device(Base):
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, index=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False, index=True)
    vendor = Column(String, nullable=False)
    vendor_device_id = Column(String, nullable=False)
    
    # Device Info
    device_type = Column(String, nullable=False)  # inverter, microinverter, panel, battery, meter
    model = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    serial_number = Column(String, nullable=True, index=True)
    
    # Status
    status = Column(String, default="Unknown")  # Online, Offline, Warning
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_reported = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site = relationship("Site", back_populates="devices")
    
    def __repr__(self):
        return f"<Device(id={self.id}, type={self.device_type}, serial={self.serial_number})>"

