"""
Site Model
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Site(Base):
    __tablename__ = "sites"
    
    id = Column(String, primary_key=True, index=True)
    vendor = Column(String, nullable=False, index=True)  # SolarEdge, Enphase, etc.
    vendor_site_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="Unknown")  # Online, Offline, Warning, Maintenance
    
    # Power & Energy
    peak_power_kw = Column(Float, default=0.0)
    current_power_kw = Column(Float, default=0.0)
    daily_production_kwh = Column(Float, default=0.0)
    lifetime_energy_mwh = Column(Float, default=0.0)
    
    # Health
    health_score = Column(Integer, default=100)
    
    # Location
    address_json = Column(JSON)  # {street, city, state, zip, country}
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_fetch_at = Column(DateTime, nullable=True)
    
    # Relationships
    devices = relationship("Device", back_populates="site", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="site", cascade="all, delete-orphan")
    metrics = relationship("TimeseriesMetric", back_populates="site", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Site(id={self.id}, name={self.name}, vendor={self.vendor})>"

