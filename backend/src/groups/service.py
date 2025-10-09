import random

from fastapi import HTTPException
from src.groups.repository import GroupRepository
from src.groups.schemas import CreateGroup, Group


class GroupService:
    """Service layer for group business logic"""

    def __init__(self, group_repository: GroupRepository):
        self.group_repository = group_repository

    def generate_unique_invite_code(self) -> str:
        """
        Generate a unique 10-character invite code.
        Uses Python's random module with URL-safe alphabet excluding confusing characters.
        """
        # Custom alphabet with only capital letters excluding confusing characters: O, I
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ"

        max_attempts = 10
        for _ in range(max_attempts):
            invite_code = "".join(random.choices(alphabet, k=10))
            if self.group_repository.is_invite_code_unique(invite_code):
                return invite_code

        raise HTTPException(
            status_code=500,
            detail="Failed to generate unique invite code after multiple attempts",
        )

    def create_group(self, user_id: int, group_data: CreateGroup) -> Group:
        """
        Create a new group with the user as owner.
        Generates unique invite code and atomically creates group with owner membership.
        Returns group details with role and member count information.
        """
        invite_code = self.generate_unique_invite_code()

        group = self.group_repository.create_group(
            name=group_data.name,
            description=group_data.description,
            invite_code=invite_code,
            cost_per_distance=group_data.cost_per_distance,
            distance_unit=group_data.distance_unit,
            owner_user_id=user_id,
        )

        return Group.model_validate(group)

    def get_user_groups(self, user_id: int) -> list[Group]:
        """
        Get all groups that the user is a member of (either owner or member).
        Returns list of groups.
        """
        groups = self.group_repository.get_groups_by_user_id(user_id)
        return groups
