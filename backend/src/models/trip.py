from sqlalchemy import DECIMAL, TIMESTAMP, Boolean, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.base import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_address = Column(Text, nullable=False)
    end_address = Column(Text, nullable=False)
    distance_km = Column(DECIMAL(10, 2), nullable=False)
    cost_usd = Column(DECIMAL(10, 2), nullable=False)
    trip_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    is_paid = Column(Boolean, default=False, nullable=False)

    group = relationship("Group", back_populates="trips")
    user = relationship("User", back_populates="trips")
