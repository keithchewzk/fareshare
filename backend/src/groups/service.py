import random

from fastapi import HTTPException
from src.groups.repository import GroupRepository
from src.groups.schemas import CreateGroup, Group, GroupListItem


class GroupService:
    """Service layer for group business logic"""

    def __init__(self, group_repository: GroupRepository):
        self.group_repository = group_repository

    def get_user_groups(self, user_id: int) -> list[GroupListItem]:
        """
        Get all groups that the user is a member of (either owner or member).
        Returns lightweight list of groups with minimal information.
        """
        groups = self.group_repository.get_groups_by_user_id(user_id)
        return [GroupListItem.model_validate(group) for group in groups]

    def get_group_details(self, user_id: int, group_id: int) -> Group:
        """
        Get detailed information about a specific group.

        Validates that the user is a member of the group before returning details.
        Only group members can view full group information including invite codes.

        Raises:
            HTTPException 404: Group not found
            HTTPException 403: User not a member of the group
        """
        group = self.group_repository.get_group_by_id(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        if not self.group_repository.is_user_in_group(user_id, group_id):
            raise HTTPException(
                status_code=403,
                detail="Access denied: You are not a member of this group",
            )

        return Group.model_validate(group)

    def create_group(self, user_id: int, group_data: CreateGroup) -> Group:
        """
        Create a new group with the user as owner.
        Generates unique invite code and atomically creates group with owner membership.
        Returns group details with role and member count information.
        """
        invite_code = self._generate_unique_invite_code()

        group = self.group_repository.create_group(
            name=group_data.name,
            description=group_data.description,
            invite_code=invite_code,
            cost_per_distance=group_data.cost_per_distance,
            distance_unit=group_data.distance_unit,
            owner_user_id=user_id,
        )

        return Group.model_validate(group)

    def _generate_unique_invite_code(self) -> str:
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

    def join_group(self, user_id: int, invite_code: str) -> Group:
        """
        Add a user to a group using an invite code.

        Finds the group by invite code, validates user isn't already a member,
        then adds the user as a 'member' role to the group.

        Raises:
            HTTPException 404: Invalid invite code
            HTTPException 400: User already in group
        """
        group = self.group_repository.get_group_by_invite_code(invite_code)
        if not group:
            raise HTTPException(status_code=404, detail="Invalid invite code")

        if self.group_repository.is_user_in_group(user_id, group.id):
            raise HTTPException(
                status_code=400, detail="User is already a member of this group"
            )

        self.group_repository.add_user_to_group(user_id, group.id)
        return group

    def delete_group(self, user_id: int, group_id: int) -> None:
        """
        Delete a group. Only owners can delete their groups.

        Validates that the group exists and the user is the owner before deletion.
        All group memberships are automatically deleted via cascade relationship.

        Raises:
            HTTPException 404: Group not found
            HTTPException 403: User is not the owner of the group
        """
        group = self.group_repository.get_group_by_id(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        is_deleted = self.group_repository.delete_group(group_id, user_id)
        if not is_deleted:
            raise HTTPException(
                status_code=403,
                detail="Access denied: Only group owners can delete groups",
            )
