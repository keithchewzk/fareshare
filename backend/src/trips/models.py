from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.base import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(
        Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False
    )
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    name = Column(String(100), nullable=False)
    description = Column(String(1000), nullable=True)
    stops = Column(JSONB, nullable=False)
    total_distance = Column(Float, nullable=False)
    cost_per_distance = Column(Numeric(10, 2), nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)

    group = relationship("Group", back_populates="trips")
    creator = relationship("User", back_populates="trips")
