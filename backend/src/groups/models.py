from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.base import Base


class Group(Base):
    """
    Represents a car-sharing group that users can create and join.
    Groups have unique invite codes for joining and track creation timestamps.
    """

    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    invite_code = Column(String(10), unique=True, nullable=False)
    cost_per_distance = Column(Numeric(10, 2), nullable=False)
    distance_unit = Column(String(2), nullable=False, default="km")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "distance_unit IN ('km', 'mi')", name="check_distance_unit_valid"
        ),
    )

    memberships = relationship(
        "GroupMembership", back_populates="group", cascade="all, delete-orphan"
    )


class GroupMembership(Base):
    """
    Represents a user's membership in a group with role-based permissions.
    Roles can be 'owner' (creator with admin privileges) or 'member' (standard access).
    Each user can only be in a group once.
    """

    __tablename__ = "group_memberships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(
        Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role = Column(String(20), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('owner', 'member')", name="check_role_valid"),
        UniqueConstraint("group_id", "user_id", name="unique_group_user_membership"),
    )

    group = relationship("Group", back_populates="memberships")
    user = relationship("User", back_populates="group_memberships")
