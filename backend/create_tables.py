#!/usr/bin/env python3
"""
Create database tables using SQLAlchemy
"""
import sys
import os

# Add src to path
sys.path.append('src')

from src.models.base import engine, Base
from src.models import User, Group, GroupMember, Trip

if __name__ == "__main__":
    print("Creating database tables...")
    Base.metadata.create_all(engine)
    print("Tables created successfully!")

    # Verify tables were created
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Created tables: {tables}")