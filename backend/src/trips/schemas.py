from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class CreateTrip(BaseModel):
    """Schema for creating a new trip."""
    group_id: int
    name: str
    description: Optional[str] = None
    stops: List[Dict[str, Any]]