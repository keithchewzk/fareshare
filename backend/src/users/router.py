from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.models.base import get_db

from .schemas import UserCreate, UserResponse
from .service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    return UserService.create_user(db, user_data)
