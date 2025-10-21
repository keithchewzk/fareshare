from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Group(BaseModel):
    """Schema for group item in user's groups list"""

    id: int
    name: str
    description: Optional[str]
    invite_code: str
    cost_per_distance: Decimal
    distance_unit: Literal["km", "mi"]
    created_at: datetime

    class Config:
        from_attributes = True


class GroupListItem(BaseModel):
    """Schema for group item in user's groups list (lightweight)"""

    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class CreateGroup(BaseModel):
    """Schema for creating a new group"""

    name: str = Field(..., min_length=1, max_length=100, description="Group name")
    description: Optional[str] = Field(
        None, max_length=1000, description="Optional group description"
    )
    cost_per_distance: Decimal = Field(..., gt=0, description="Cost per distance unit")
    distance_unit: Literal["km", "mi"] = Field(
        default="km", description="Distance unit (km or mi)"
    )


class JoinGroup(BaseModel):
    """Schema for joining a group via invite code"""

    invite_code: str = Field(
        ..., min_length=10, max_length=10, description="Group invite code"
    )
