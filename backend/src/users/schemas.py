from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    """Schema for creating a new user"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password (min 6 characters)")
    first_name: str = Field(..., max_length=50, description="User's first name")
    last_name: Optional[str] = Field(None, max_length=50, description="User's last name")

class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    id: int
    email: str
    first_name: str
    last_name: Optional[str] = None

    class Config:
        from_attributes = True  # For SQLAlchemy model compatibility