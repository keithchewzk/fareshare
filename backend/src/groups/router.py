from fastapi import APIRouter, Depends
from src.groups.dependencies import get_group_service
from src.users.dependencies import get_current_user
from src.groups.schemas import CreateGroup, Group, GroupListItem, JoinGroup, Membership
from src.groups.service import GroupService
from src.users.models import User

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("/", response_model=list[GroupListItem])
async def get_user_groups(
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Get all groups that the current user is a member of (lightweight list)."""
    return group_service.get_user_groups(current_user.id)


@router.get("/{group_id}", response_model=Group)
async def get_group_details(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Get detailed information about a specific group. User must be a member."""
    return group_service.get_group_details(current_user.id, group_id)


@router.post("/", response_model=Group, status_code=201)
async def create_group(
    group_data: CreateGroup,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Create a new group. The creator automatically becomes the owner."""
    return group_service.create_group(current_user.id, group_data)


@router.post("/join", response_model=Group)
async def join_group(
    join_data: JoinGroup,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Join a group using an invite code. User becomes a member of the group."""
    return group_service.join_group(current_user.id, join_data.invite_code)


@router.post("/{group_id}/leave", status_code=204)
async def leave_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Leave a group voluntarily. Only members can leave - owners must delete the group."""
    group_service.leave_group(current_user.id, group_id)


@router.get("/{group_id}/membership", response_model=Membership)
async def get_user_membership(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Get the current user's membership information for a specific group."""
    return group_service.get_user_membership(current_user.id, group_id)


@router.delete("/{group_id}", status_code=204)
async def delete_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Delete a group. Only owners can delete their groups."""
    group_service.delete_group(current_user.id, group_id)
