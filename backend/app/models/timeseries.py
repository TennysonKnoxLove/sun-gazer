"""
Timeseries Metric Model
"""
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class TimeseriesMetric(Base):
    __tablename__ = "timeseries_metrics"
    
    id = Column(String, primary_key=True, index=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=True, index=True)
    
    # Metric Data
    timestamp = Column(DateTime, nullable=False, index=True)
    metric_name = Column(String, nullable=False, index=True)  # power, energy, voltage, etc.
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=True)  # kW, kWh, V, A, etc.
    
    # Relationships
    site = relationship("Site", back_populates="metrics")
    
    # Composite index for efficient queries
    __table_args__ = (
        Index('idx_site_metric_time', 'site_id', 'metric_name', 'timestamp'),
    )
    
    def __repr__(self):
        return f"<TimeseriesMetric(site_id={self.site_id}, metric={self.metric_name}, value={self.value})>"

