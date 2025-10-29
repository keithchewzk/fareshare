from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session
from src.groups.models import Group, GroupMembership
from src.users.models import User


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

    def get_group_by_id(self, group_id: int) -> Optional[Group]:
        """Get a group by its ID"""
        return self.db.query(Group).filter(Group.id == group_id).first()

    def create_group(
        self,
        name: str,
        description: Optional[str],
        invite_code: str,
        cost_per_distance: Decimal,
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
            .filter(
                GroupMembership.user_id == user_id, GroupMembership.group_id == group_id
            )
            .first()
        )
        return existing is not None

    def add_user_to_group(self, user_id: int, group_id: int) -> GroupMembership:
        """Add a user as a member to a group"""
        membership = GroupMembership(user_id=user_id, group_id=group_id, role="member")
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        return membership

    def get_user_membership(
        self, user_id: int, group_id: int
    ) -> Optional[GroupMembership]:
        """Get user's membership record for a specific group"""
        return (
            self.db.query(GroupMembership)
            .filter(
                GroupMembership.user_id == user_id,
                GroupMembership.group_id == group_id,
            )
            .first()
        )

    def remove_user_from_group(self, user_id: int, group_id: int) -> bool:
        """
        Remove a user from a group by deleting their membership record.
        Returns: True if removed successfully, False if user was not in group.
        """
        try:
            membership = self.get_user_membership(user_id, group_id)
            if not membership:
                return False

            self.db.delete(membership)
            self.db.commit()
            return True

        except Exception:
            self.db.rollback()
            raise

    def delete_group(self, group_id: int, owner_user_id: int) -> bool:
        """
        Delete group only if user is owner.
        Returns: True if deleted successfully, False if user is not owner.
        The cascade relationship will automatically delete all memberships.
        """
        try:
            # Check if user is owner of the exisitng group
            group = (
                self.db.query(Group)
                .join(Group.memberships)
                .filter(
                    Group.id == group_id,
                    GroupMembership.user_id == owner_user_id,
                    GroupMembership.role == "owner",
                )
                .first()
            )

            if not group:
                return False

            # Delete the group (cascade will handle memberships)
            self.db.delete(group)
            self.db.commit()

            return True

        except Exception:
            self.db.rollback()
            raise

    def get_group_members(self, group_id: int) -> list[tuple]:
        """
        Get all members of a group with their user details and roles.
        Returns list of tuples: (user_id, first_name, last_name, role)
        Ordered by role (owners first) then alphabetically by first name.
        """
        results = (
            self.db.query(
                User.id,
                User.first_name,
                User.last_name,
                GroupMembership.role,
            )
            .join(GroupMembership, GroupMembership.user_id == User.id)
            .filter(GroupMembership.group_id == group_id)
            .order_by(GroupMembership.role.desc(), User.first_name.asc())
            .all()
        )

        return results
