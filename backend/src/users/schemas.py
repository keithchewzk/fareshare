from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    """Schema for creating a new user"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password (min 6 characters)")
    full_name: Optional[str] = Field(None, max_length=100, description="User's full name")

class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True  # For SQLAlchemy model compatibility