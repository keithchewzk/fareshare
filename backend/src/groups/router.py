from fastapi import APIRouter, Depends
from src.auth.dependencies import get_current_user
from src.groups.dependencies import get_group_service
from src.groups.schemas import CreateGroup, Group
from src.groups.service import GroupService
from src.users.models import User

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("/", response_model=list[Group])
async def get_user_groups(
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Get all groups that the current user is a member of."""
    return group_service.get_user_groups(current_user.id)


@router.post("/", response_model=Group, status_code=201)
async def create_group(
    group_data: CreateGroup,
    current_user: User = Depends(get_current_user),
    group_service: GroupService = Depends(get_group_service),
):
    """Create a new group. The creator automatically becomes the owner."""
    return group_service.create_group(current_user.id, group_data)
