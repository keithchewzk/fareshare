# FareShare Backend - Technical Overview

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. The backend provides user authentication and will expand to include group management and trip tracking functionality.

**Current Status**: Core authentication system implemented with JWT-based security. User registration and login functionality complete with production-ready bcrypt password hashing. **Groups domain database foundation completed** - SQLAlchemy models and database tables created. Ready for groups business logic implementation.

## Technical Architecture

### Technology Stack
- **Backend**: Python 3.x + FastAPI
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0.23 with Alembic for migrations
- **API Documentation**: Auto-generated via FastAPI (Swagger/OpenAPI)
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload enabled for development

### Project Structure
```
backend/
├── src/                    # Main application code
│   ├── main.py            # FastAPI application entry point
│   ├── settings.py        # Application configuration with JWT settings
│   ├── router.py          # Main API router
│   ├── models/            # Database models
│   │   ├── base.py        # SQLAlchemy base configuration
│   │   └── __init__.py    # Model imports
│   ├── auth/              # Authentication domain
│   │   ├── jwt_utils.py   # JWT token creation and validation
│   │   ├── schemas.py     # Auth request/response schemas
│   │   ├── service.py     # Authentication business logic
│   │   ├── router.py      # Auth API endpoints (/auth/login, /auth/me)
│   │   ├── dependencies.py # Auth dependency injection & get_current_user
│   │   └── __init__.py    # Auth module init
│   ├── users/             # User domain
│   │   ├── models.py      # User database models (with first_name/last_name)
│   │   ├── schemas.py     # Pydantic schemas for validation
│   │   ├── repository.py  # User database operations
│   │   ├── service.py     # User business logic with bcrypt
│   │   ├── router.py      # User API endpoints
│   │   ├── dependencies.py # Dependency injection
│   │   └── __init__.py    # User module init
│   └── groups/            # Groups domain (Phase 1 complete)
│       ├── models.py      # Group and GroupMembership models
│       └── __init__.py    # Groups module init
├── alembic/               # Database migration tools
│   └── versions/          # Migration files (users and groups tables created)
├── requirements.txt       # Python dependencies (includes bcrypt, pyjwt)
└── Dockerfile            # Container configuration
```

## Database Schema

### Current Implementation

#### Users Table
```sql
users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NULL
)
```

#### Groups Table ✅ **NEW**
```sql
groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    cost_per_distance NUMERIC(10,4) NOT NULL,
    distance_unit VARCHAR(2) NOT NULL DEFAULT 'km',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (distance_unit IN ('km', 'mi'))
)
```

#### Group Memberships Table ✅ **NEW**
```sql
group_memberships (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
)
```

### Future Implementation
Additional tables for trips and related functionality will be added after groups business logic is complete.

## API Endpoints

### Current Implementation

#### Authentication
- `POST /auth/login` - User login with JWT token (returns access_token)
- `GET /auth/me` - Get current user profile (protected endpoint)

#### User Management
- `POST /users` - Create a new user (public registration)

#### System
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint

### Planned Implementation

#### Group Management (Next Priority)
- `POST /groups` - Create a new group
- `GET /groups` - Get user's groups
- `POST /groups/{id}/join` - Join a group

#### Trip Management
- `POST /trips` - Log a new trip
- `GET /trips` - Get user's trips
- Trip cost calculation endpoints

#### Future Features
- Payment splitting and tracking
- Google Maps integration for distance calculation

## Domain-Driven Design

The codebase follows a domain-driven design approach with clear separation of concerns:

- **Models**: SQLAlchemy ORM models for database entities
- **Schemas**: Pydantic models for request/response validation
- **Repository**: Database operations and data access layer
- **Services**: Business logic layer
- **Routers**: API endpoint definitions
- **Dependencies**: Dependency injection for services
- **Base**: Shared database configuration and utilities

Currently implemented: `users` and `auth` domains (complete), `groups` domain (Phase 1 complete - database foundation). Each domain is self-contained with its own models, schemas, repository, services, routers, and dependencies. Ready to implement groups business logic (Phase 2) and then `trips` domain following the same architectural pattern.

## Key Implementation Details

### Current Features

#### Authentication System (`src/auth/`)
- **JWT-based authentication**: Production-ready token system with HS256 signing
- **Login endpoint**: Email/password authentication with JWT token response
- **Protected endpoints**: `get_current_user()` dependency for route protection
- **Token validation**: Automatic signature verification and expiration checking
- **Security headers**: Proper WWW-Authenticate headers for 401 responses
- **OpenAPI integration**: Automatic "Authorize" button in Swagger UI

#### User Management (`src/users/`)
- **User Registration**: Email validation with bcrypt password hashing
- **Repository Pattern**: Clean separation between business logic and database operations
- **Dependency Injection**: Service layer with injected repository dependencies
- **Schema Validation**: Pydantic schemas for request/response validation
- **Database Integration**: SQLAlchemy ORM for user entities

#### Configuration (`src/settings.py`)
- **Environment-based configuration**: Pydantic BaseSettings with .env support
- **CORS configuration**: Frontend integration ready
- **Database URL configuration**: PostgreSQL connection settings
- **JWT configuration**: Secret key, algorithm (HS256), expiration (30 minutes)
- **Development/production environment support**: Configurable settings

#### Database Setup
- **Alembic integration**: Database migrations with users table created
- **SQLAlchemy 2.0**: Modern ORM with declarative base
- **PostgreSQL connection**: Proper session management
- **Docker Compose setup**: Local development database

### Future Features
- Group management with invite codes
- Trip logging and tracking
- Google Maps integration for distance calculation
- Cost calculation and payment tracking

## Security Notes

**✅ Current Security Implementation**:
- **Production-ready bcrypt password hashing**: Secure password storage with salt
- **JWT-based authentication**: Industry-standard token authentication
- **Protected endpoints**: Route-level authentication with `get_current_user()` dependency
- **Token expiration**: 30-minute token lifetime for security
- **User enumeration protection**: Same error messages for invalid email/password

**Security Considerations**:
- **JWT Secret Key**: Change default secret in production environment
- **Token expiration**: Currently 30 minutes, adjust based on use case
- **HTTPS**: Ensure HTTPS in production for token transmission
- **Logout**: Client-side token deletion for MVP (server-side blacklist not implemented)

**Future Security Enhancements**:
- Token blacklisting for secure logout
- Refresh token implementation
- Rate limiting on authentication endpoints
- Password reset functionality

## Development Setup

### Local Development
```bash
# Start services
./start.sh

# Access API documentation
http://localhost:8000/docs

# Database access
postgresql://fareshare_user:fareshare_password@localhost:5432/fareshare
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ENVIRONMENT`: development/production
- `CORS_ORIGINS`: Allowed frontend origins
- `JWT_SECRET_KEY`: Secret key for JWT token signing (change in production)
- `JWT_ALGORITHM`: JWT signing algorithm (default: HS256)
- `JWT_EXPIRE_MINUTES`: Token expiration time in minutes (default: 30)

### Docker Configuration
- PostgreSQL 15 with health checks
- Backend with hot reload in development
- Volume mounting for development workflow

## Coding Standards

### Code Documentation Standards
- **Minimize inline comments**: Only use inline comments when code logic is complex or ambiguous
- **Use comprehensive docstrings**: Explain function purpose, parameters, return values, and business logic in docstrings
- **Prefer self-documenting code**: Write clear, readable code that explains itself
- **Example**:
  ```python
  # BAD: Too many inline comments
  def create_user(self, user_data: UserCreate) -> User:
      # Check if user already exists
      existing_user = self.user_repository.get_by_email(user_data.email)
      if existing_user:
          # Raise error if user exists
          raise HTTPException(status_code=400, detail="Email already registered")

      # Hash the password
      hashed_password = self.hash_password(user_data.password)
      # Create and return user
      return self.user_repository.create(...)

  # GOOD: Clear docstring, minimal inline comments
  def create_user(self, user_data: UserCreate) -> User:
      """
      Create a new user with encrypted password.
      Validates email uniqueness and uses bcrypt for secure password storage.
      """
      existing_user = self.user_repository.get_by_email(user_data.email)
      if existing_user:
          raise HTTPException(status_code=400, detail="Email already registered")

      hashed_password = self.hash_password(user_data.password)
      return self.user_repository.create(...)
  ```

### Import Standards
- **Always use absolute imports**: Use `from src.users.models import User` instead of `from .models import User`
- This ensures clarity about the module location and prevents import conflicts
- Apply this consistently across all Python files in the project

### Architecture Standards
- **Repository Pattern**: Separate database operations (repository) from business logic (service)
- **Dependency Injection**: Inject dependencies at the service level, not at the router level
- **Domain Organization**: Each domain (users, groups, trips) should be self-contained with:
  - `models.py` - Database models
  - `schemas.py` - Pydantic validation schemas
  - `repository.py` - Database operations
  - `service.py` - Business logic
  - `router.py` - API endpoints
  - `dependencies.py` - Dependency injection functions

## Dependencies

### Core Dependencies
- `fastapi==0.104.1`: Web framework
- `sqlalchemy==2.0.23`: ORM
- `psycopg2-binary==2.9.9`: PostgreSQL adapter
- `alembic==1.13.1`: Database migrations
- `pydantic==2.5.0`: Data validation
- `uvicorn[standard]==0.24.0`: ASGI server
- `bcrypt==4.1.2`: Secure password hashing
- `pyjwt==2.8.0`: JWT token implementation

### Development Dependencies
- `python-dotenv==1.0.0`: Environment variable management
- `httpx==0.25.2`: HTTP client for testing
- `email-validator==2.1.0`: Email validation support

## Next Steps

1. **Implement Group Management**: Add group creation, joining, and member management
2. **Implement Trip Management**: Add trip logging with user association
3. **Add Trip-Group Association**: Connect trips to specific groups
4. **Implement Cost Calculation**: Calculate trip costs and split among group members
5. **Google Maps Integration**: Add distance calculation API for accurate trip costs
6. **Frontend Integration**: Connect with React frontend
7. **Testing**: Add comprehensive test suite
8. **Deployment**: Prepare for Railway deployment with production environment configuration

## Groups Domain Implementation Plan (Temporary. Remove upon development completion.)

### **Overview**
The Groups domain will enable users to create and join car-sharing groups. Groups use role-based permissions where creators become owners with administrative privileges, while joiners become members with limited permissions.

### **Database Schema**

#### **Groups Table**
```sql
groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)
```

#### **Group Memberships Table**
```sql
group_memberships (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
)
```

### **Role-Based Permissions**

#### **Owner Permissions**
- ✅ View group and members
- ✅ Kick members from group
- ✅ Delete entire group
- ✅ Change group name/description
- ✅ Generate new invite codes

#### **Member Permissions**
- ✅ View group and members
- ✅ Leave group voluntarily
- ❌ Cannot kick other members
- ❌ Cannot delete group
- ❌ Cannot modify group settings

### **Domain Structure**
```
src/groups/
├── models.py          # Group, GroupMembership SQLAlchemy models
├── schemas.py         # CreateGroup, GroupResponse, MemberResponse schemas
├── repository.py      # Database operations with role checking
├── service.py         # Business logic with authorization
├── router.py          # API endpoints with role validation
├── dependencies.py    # Group access dependencies
└── __init__.py
```

### **API Endpoints**

#### **Group Management**
- `POST /groups` - Create group (user becomes owner)
- `GET /groups` - Get user's groups (any role)
- `GET /groups/{id}` - Get group details (members only)
- `GET /groups/{id}/members` - Get group members (members only)
- `DELETE /groups/{id}` - Delete group (owners only)

#### **Membership Management**
- `POST /groups/{id}/join` - Join via invite code (becomes member)
- `POST /groups/{id}/leave` - Leave group (members only, owners can't leave)
- `DELETE /groups/{id}/members/{user_id}` - Kick member (owners only)

### **Key Business Logic**

#### **Group Creation**
- Generate unique 10-character invite code
- Creator automatically becomes owner
- Invite codes are permanent (no expiration)

#### **Authorization Methods**
```python
def get_user_membership_in_group(self, group_id: int, user_id: int) -> GroupMembership | None:
    """Returns membership record or None if not in group"""

def require_group_member(self, group_id: int, user_id: int):
    """Raises 403 if user not in group"""

def require_group_owner(self, group_id: int, user_id: int):
    """Raises 403 if user not owner of group"""
```

#### **Edge Cases to Handle**
- **Owner self-removal**: Not allowed (must delete group or transfer ownership)
- **Invalid invite codes**: Return clear error messages
- **Duplicate membership**: Handle gracefully
- **Group privacy**: Groups only visible to members
- **Cascade deletion**: Removing groups deletes all memberships

### **API Flow Examples**

#### **Create Group**
```http
POST /groups
Authorization: Bearer <token>
{
    "name": "Family Car Sharing",
    "description": "Smith family car usage tracking"
}

Response:
{
    "id": 1,
    "name": "Family Car Sharing",
    "description": "Smith family car usage tracking",
    "invite_code": "ABC123XYZ",
    "role": "owner",
    "member_count": 1,
    "created_at": "2024-01-01T10:00:00Z"
}
```

#### **Join Group**
```http
POST /groups/1/join
Authorization: Bearer <token>
{
    "invite_code": "ABC123XYZ"
}

Response:
{
    "message": "Successfully joined group",
    "group_name": "Family Car Sharing",
    "role": "member"
}
```

#### **Get User's Groups**
```http
GET /groups
Authorization: Bearer <token>

Response:
[
    {
        "id": 1,
        "name": "Family Car Sharing",
        "role": "owner",
        "member_count": 3
    },
    {
        "id": 2,
        "name": "Work Carpool",
        "role": "member",
        "member_count": 5
    }
]
```

#### **Owner Kicks Member**
```http
DELETE /groups/1/members/5
Authorization: Bearer <token>  # Must be owner

Response:
{
    "message": "User removed from group"
}
```

### **Implementation Phases**

#### **Phase 1: Database Foundation**
1. Create Alembic migrations for groups and group_memberships tables
2. Implement SQLAlchemy models with relationships
3. Add User model relationships to groups

#### **Phase 2: Core Business Logic**
1. Repository layer with membership queries
2. Service layer with role-based authorization
3. Invite code generation utilities

#### **Phase 3: API Endpoints**
1. Group CRUD operations
2. Membership management endpoints
3. Role-based route protection

#### **Phase 4: Testing & Validation**
1. Test all endpoints via Swagger UI
2. Validate role-based permissions
3. Test edge cases and error scenarios

### **Future Enhancements**
- Group ownership transfer functionality
- Group settings and preferences
- Group activity logs
- Bulk member invitations

## Authentication Testing

### Complete Flow Testing with Swagger UI

1. **Start server**: `uvicorn src.main:app --reload`
2. **Open Swagger UI**: `http://localhost:8000/docs`
3. **Register user**: `POST /users` with email/password
4. **Login**: `POST /auth/login` to get JWT token
5. **Authorize**: Click "Authorize" button, enter `Bearer <token>`
6. **Test protected endpoint**: `GET /auth/me` to verify authentication works
7. **Test without auth**: Logout and try protected endpoint (should get 401)