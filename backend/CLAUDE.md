# FareShare Backend - Technical Overview

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. The backend provides user authentication and will expand to include group management and trip tracking functionality.

**Current Status**: Core authentication system implemented with JWT-based security. User registration and login functionality complete with production-ready bcrypt password hashing. **Groups domain Phase 2 completed** - Full group creation functionality implemented with business logic, API endpoints, and invite code generation. Ready for additional group management features (joining, membership management).

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
│   │   └── __init__.py    # Empty init file (avoid circular imports)
│   ├── users/             # User domain (CONSOLIDATED - includes auth)
│   │   ├── models.py      # User database models (with first_name/last_name)
│   │   ├── schemas.py     # User & auth schemas (CreateUser, LoginRequest, etc.)
│   │   ├── repository.py  # User database operations
│   │   ├── service.py     # User business logic with bcrypt + JWT authentication
│   │   ├── router.py      # User API endpoints (PUT /users, POST /users, GET /users/me)
│   │   ├── dependencies.py # Dependency injection + get_current_user
│   │   ├── jwt_utils.py   # JWT token creation and validation
│   │   └── __init__.py    # Empty init file (avoid circular imports)
│   └── groups/            # Groups domain (Phase 2 complete)
│       ├── models.py      # Group and GroupMembership models
│       ├── schemas.py     # CreateGroup, Group schemas
│       ├── repository.py  # Group database operations
│       ├── service.py     # Group business logic with invite codes
│       ├── router.py      # Group API endpoints (/groups)
│       ├── dependencies.py # Group dependency injection
│       └── __init__.py    # Empty init file (avoid circular imports)
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
    description VARCHAR(1000),
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    cost_per_distance NUMERIC(10,2) NOT NULL,
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

### Current Implementation ✅ **CONSOLIDATED ENDPOINTS**

#### User Management (Includes Authentication)
- `PUT /users` - Create a new user account (public registration)
- `POST /users` - User login with JWT token (returns access_token)
- `GET /users/me` - Get current user profile (protected endpoint)

#### System
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint

### Planned Implementation

#### Group Management ✅ **IMPLEMENTED**
- `POST /groups` - Create a new group ✅ **COMPLETE**
- `GET /groups` - Get user's groups ✅ **COMPLETE**
- `GET /groups/{group_id}` - Get group details ✅ **COMPLETE**
- `POST /groups/join` - Join a group via invite code ✅ **COMPLETE**
- `POST /groups/{group_id}/leave` - Leave a group (members only) ✅ **COMPLETE**
- `DELETE /groups/{group_id}` - Delete a group (owners only) ✅ **COMPLETE**

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
- **JWT Utils**: Token creation and validation utilities
- **Base**: Shared database configuration and utilities

Currently implemented: **`users` domain (CONSOLIDATED - includes authentication)** and `groups` domain (Phase 2 complete - group creation functionality). Each domain is self-contained with its own models, schemas, repository, services, routers, dependencies, and utilities. The **auth domain has been eliminated** - all authentication functionality consolidated into the users domain. Ready to implement remaining group management features and then `trips` domain following the same architectural pattern.

## Key Implementation Details

### Current Features

#### User Management System (`src/users/`) ✅ **CONSOLIDATED**
- **User Registration**: `PUT /users` - Email validation with bcrypt password hashing
- **User Authentication**: `POST /users` - JWT-based login with production-ready token system
- **User Profile**: `GET /users/me` - Protected endpoint for user profile access
- **JWT Token Management**: Create, validate, and extract user data from tokens
- **Protected Endpoints**: `get_current_user()` dependency for route protection
- **Repository Pattern**: Clean separation between business logic and database operations
- **Dependency Injection**: Service layer with injected repository dependencies
- **Schema Validation**: Pydantic schemas for all user and auth operations
- **Security Features**:
  - bcrypt password hashing
  - JWT token validation with expiration
  - Proper WWW-Authenticate headers for 401 responses
  - User enumeration protection
- **OpenAPI Integration**: Automatic "Authorize" button in Swagger UI

#### Configuration (`src/settings.py`)
- **Environment-based configuration**: Pydantic BaseSettings with .env support
- **CORS configuration**: Frontend integration ready
- **Database URL configuration**: PostgreSQL connection settings
- **JWT configuration**: Secret key, algorithm (HS256), expiration (30 minutes)
- **Development/production environment support**: Configurable settings

#### Groups System (`src/groups/`) ✅ **NEW**
- **Group Creation**: Complete POST /groups endpoint with authentication
- **Invite Code Generation**: 10-character codes using capital letters (A-Z excluding O,I)
- **Decimal Precision**: Cost per distance uses NUMERIC(10,2) for exact financial calculations
- **Atomic Operations**: Group creation with owner membership in single transaction
- **Repository Pattern**: Clean separation of database operations and business logic
- **Pydantic Integration**: Automatic model validation with Group.model_validate()
- **Dependency Injection**: Service layer with injected repository dependencies

#### Database Setup
- **Alembic integration**: Database migrations with users and groups tables created
- **SQLAlchemy 2.0**: Modern ORM with declarative base
- **PostgreSQL connection**: Proper session management
- **Docker Compose setup**: Local development database

### Future Features
- Additional group management features (joining, member management)
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
  def create_user(self, user_data: CreateUser) -> User:
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
  def create_user(self, user_data: CreateUser) -> User:
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

1. **Complete Group Management**: Add group joining and member management endpoints
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
    description VARCHAR(1000),
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    cost_per_distance NUMERIC(10,2) NOT NULL,
    distance_unit VARCHAR(2) NOT NULL DEFAULT 'km',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (distance_unit IN ('km', 'mi'))
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
- ✅ Leave group voluntarily ✅ **IMPLEMENTED**
- ❌ Cannot kick other members
- ❌ Cannot delete group
- ❌ Cannot modify group settings

### **Domain Structure**
```
src/groups/
├── models.py          # Group, GroupMembership SQLAlchemy models
├── schemas.py         # CreateGroup, Group, MemberResponse schemas
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
- `GET /groups/{id}` - Get group details (members only) ✅ **COMPLETE**
- `GET /groups/{id}/members` - Get group members (members only)
- `DELETE /groups/{id}` - Delete group (owners only) ✅ **COMPLETE**

#### **Membership Management**
- `POST /groups/{id}/join` - Join via invite code (becomes member) ✅ **COMPLETE**
- `POST /groups/{id}/leave` - Leave group (members only, owners can't leave) ✅ **COMPLETE**
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

#### **Leave Group** ✅ **NEW**
```http
POST /groups/1/leave
Authorization: Bearer <token>  # Must be member (not owner)

Response: 204 No Content
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

#### **Phase 1: Database Foundation** ✅ **COMPLETE**
1. ✅ Create Alembic migrations for groups and group_memberships tables
2. ✅ Implement SQLAlchemy models with relationships
3. ✅ Add User model relationships to groups

#### **Phase 2: Core Business Logic** ✅ **COMPLETE**
1. ✅ Repository layer with database operations
2. ✅ Service layer with group creation logic
3. ✅ Invite code generation utilities (10-char capital letters, no O/I)
4. ✅ Decimal precision handling for cost_per_distance

#### **Phase 3: API Endpoints** 🔄 **IN PROGRESS**
1. ✅ Group creation endpoint (POST /groups)
2. ✅ Get user's groups endpoint (GET /groups)
3. ✅ Get group details endpoint (GET /groups/{group_id})
4. ✅ Join group endpoint (POST /groups/join)
5. ✅ Leave group endpoint (POST /groups/{group_id}/leave)
6. ✅ Delete group endpoint (DELETE /groups/{group_id})
7. ⏳ Additional membership management (kick members)
8. ⏳ Role-based route protection

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
3. **Register user**: `PUT /users` with email/password/first_name
4. **Login**: `POST /users` to get JWT token
5. **Authorize**: Click "Authorize" button, enter `Bearer <token>`
6. **Test protected endpoint**: `GET /users/me` to verify authentication works
7. **Test without auth**: Logout and try protected endpoint (should get 401)