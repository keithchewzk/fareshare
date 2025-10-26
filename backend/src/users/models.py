from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=True)

    group_memberships = relationship(
        "GroupMembership", back_populates="user", cascade="all, delete-orphan"
    )
    trips = relationship(
        "Trip", back_populates="user", cascade="all, delete-orphan"
    )
