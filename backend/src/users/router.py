from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from src.models.base import get_db
from .schemas import UserCreate, UserResponse
from .service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    return UserService.create_user(db, user_data)

@router.get("/", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    """Get all users (MVP - no authentication required)"""
    return UserService.get_users(db)