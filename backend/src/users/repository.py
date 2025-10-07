from typing import Optional

from sqlalchemy.orm import Session
from src.users.models import User


class UserRepository:
    """Repository layer for user database operations"""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self, email: str, password_hash: str, full_name: Optional[str] = None
    ) -> User:
        """Create a new user in the database"""
        db_user = User(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
        )

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        return self.db.query(User).filter(User.email == email).first()
