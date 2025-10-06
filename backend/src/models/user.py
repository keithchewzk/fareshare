from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)

    created_groups = relationship("Group", back_populates="creator")
    group_memberships = relationship("GroupMember", back_populates="user")
    trips = relationship("Trip", back_populates="user")
