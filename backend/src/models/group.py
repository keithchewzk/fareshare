from sqlalchemy import (
    DECIMAL,
    Column,
    ForeignKey,
    Integer,
    PrimaryKeyConstraint,
    String,
)
from sqlalchemy.orm import relationship
from src.models.base import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cost_per_km = Column(DECIMAL(10, 4), nullable=False)
    invite_code = Column(String(10), unique=True, nullable=False)

    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship("GroupMember", back_populates="group")
    trips = relationship("Trip", back_populates="group")


class GroupMember(Base):
    __tablename__ = "group_members"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    __table_args__ = (PrimaryKeyConstraint("user_id", "group_id"),)

    user = relationship("User", back_populates="group_memberships")
    group = relationship("Group", back_populates="members")
