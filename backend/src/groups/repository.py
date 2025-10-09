from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session
from src.groups.models import Group, GroupMembership


class GroupRepository:
    """Repository layer for group database operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_groups_by_user_id(self, user_id: int) -> list[Group]:
        """
        Get all groups that a user is in.
        Uses the relationship to avoid explicit joins.
        """
        return (
            self.db.query(Group)
            .join(Group.memberships)
            .filter(GroupMembership.user_id == user_id)
            .all()
        )

    def create_group(
        self,
        name: str,
        description: Optional[str],
        invite_code: str,
        cost_per_distance: Decimal,
        distance_unit: str,
        owner_user_id: int,
    ) -> Group:
        """
        Create a new group with owner membership atomically.
        If either operation fails, both are rolled back.
        """
        try:
            group = Group(
                name=name,
                description=description,
                invite_code=invite_code,
                cost_per_distance=cost_per_distance,
                distance_unit=distance_unit,
            )

            membership = GroupMembership(
                user_id=owner_user_id,
                role="owner",
            )
            membership.group = group

            self.db.add(group)
            self.db.commit()
            self.db.refresh(group)
            return group

        except Exception:
            self.db.rollback()
            raise

    def is_invite_code_unique(self, invite_code: str) -> bool:
        """Check if invite code is unique across all groups"""
        existing = self.db.query(Group).filter(Group.invite_code == invite_code).first()
        return existing is None

    def get_group_by_invite_code(self, invite_code: str) -> Optional[Group]:
        """Find a group by its invite code"""
        return self.db.query(Group).filter(Group.invite_code == invite_code).first()

    def is_user_in_group(self, user_id: int, group_id: int) -> bool:
        """Check if a user is already a member of a group"""
        existing = (
            self.db.query(GroupMembership)
            .filter(GroupMembership.user_id == user_id, GroupMembership.group_id == group_id)
            .first()
        )
        return existing is not None

    def add_user_to_group(self, user_id: int, group_id: int) -> GroupMembership:
        """Add a user as a member to a group"""
        membership = GroupMembership(
            user_id=user_id,
            group_id=group_id,
            role="member"
        )
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        return membership
