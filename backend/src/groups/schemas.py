from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field


class CreateGroup(BaseModel):
    """Schema for creating a new group"""

    name: str = Field(..., min_length=1, max_length=100, description="Group name")
    description: Optional[str] = Field(
        None, max_length=500, description="Optional group description"
    )
    cost_per_distance: Decimal = Field(..., gt=0, description="Cost per distance unit")
    distance_unit: Literal["km", "mi"] = Field(
        default="km", description="Distance unit (km or mi)"
    )


class GroupResponse(BaseModel):
    """Schema for group response"""

    id: int
    name: str
    description: Optional[str]
    invite_code: str
    cost_per_distance: Decimal
    distance_unit: str
    created_at: datetime

    class Config:
        from_attributes = True
