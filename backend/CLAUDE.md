# FareShare Backend - Technical Overview

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. The backend provides user authentication and will expand to include group management and trip tracking functionality.

**Current Status**: Core authentication system implemented with JWT-based security. User registration and login functionality complete with production-ready bcrypt password hashing. **Groups domain completed** - Full group management functionality implemented with business logic, API endpoints, and invite code generation. **Trips domain completed** ✅ **NEW** - Full trip creation API with Google Maps distance calculation integration. **Maps domain completed** ✅ **NEW** - Complete Google Maps API integration for address autocomplete and distance calculation.

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
│   ├── groups/            # Groups domain (Phase 2 complete)
│   │   ├── models.py      # Group and GroupMembership models
│   │   ├── schemas.py     # CreateGroup, Group schemas
│   │   ├── repository.py  # Group database operations
│   │   ├── service.py     # Group business logic with invite codes
│   │   ├── router.py      # Group API endpoints (/groups)
│   │   ├── dependencies.py # Group dependency injection
│   │   └── __init__.py    # Empty init file (avoid circular imports)
│   ├── maps/              # Maps domain (Google Maps integration - COMPLETE)
│   │   ├── schemas.py     # Address autocomplete request/response schemas
│   │   ├── google_client.py # Google Places API v1 client wrapper
│   │   ├── service.py     # Maps business logic with data transformation
│   │   ├── router.py      # Maps API endpoints (/maps/autocomplete)
│   │   ├── dependencies.py # Maps dependency injection
│   │   └── __init__.py    # Empty init file (avoid circular imports)
│   └── trips/             # Trips domain (COMPLETE - Full implementation) ✅ **NEW**
│       ├── models.py      # Trip model with creator-pays approach
│       ├── schemas.py     # CreateTrip request schema
│       ├── repository.py  # Trip database operations with group validation
│       ├── service.py     # Trip business logic with mocked distance
│       ├── router.py      # Trip API endpoints (POST /trips)
│       ├── dependencies.py # Trip dependency injection
│       └── __init__.py    # Empty init file (avoid circular imports)
├── alembic/               # Database migration tools
│   └── versions/          # Migration files (users, groups, and trips tables created)
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

#### Groups Table ✅ **UPDATED**
```sql
groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    cost_per_distance NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

#### Trips Table ✅ **UPDATED**
```sql
trips (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    stops JSONB NOT NULL,
    total_distance NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Future Implementation
Additional tables for cost tracking and payment history may be added when cost splitting features are implemented.

## API Endpoints

### Current Implementation ✅ **CONSOLIDATED ENDPOINTS**

#### User Management (Includes Authentication)
- `POST /users` - Create a new user account (public registration)
- `POST /users/login` - User login with JWT token (returns access_token)
- `GET /users/me` - Get current user profile (protected endpoint)

#### System
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint

#### Maps & Address Management ✅ **COMPLETE**
- `GET /maps/autocomplete` - Get address autocomplete suggestions (Singapore region bias) ✅ **COMPLETE**
- `POST /maps/calculate-distance` - Calculate route distance using Google Place IDs ✅ **NEW**

#### Group Management ✅ **COMPLETE**
- `POST /groups` - Create a new group ✅ **COMPLETE**
- `GET /groups` - Get user's groups ✅ **COMPLETE**
- `GET /groups/{group_id}` - Get group details ✅ **COMPLETE**
- `POST /groups/join` - Join a group via invite code ✅ **COMPLETE**
- `POST /groups/{group_id}/leave` - Leave a group (members only) ✅ **COMPLETE**
- `DELETE /groups/{group_id}` - Delete a group (owners only) ✅ **COMPLETE**

#### Trip Management ✅ **IMPLEMENTED**
- `POST /trips` - Create a new trip with mocked distance ✅ **COMPLETE**
- `GET /trips` - Get user's trips ⏳ **PLANNED**
- `GET /trips/{trip_id}` - Get trip details ⏳ **PLANNED**
- `PUT /trips/{trip_id}` - Update trip (creator only) ⏳ **PLANNED**
- `DELETE /trips/{trip_id}` - Delete trip (creator only) ⏳ **PLANNED**

#### Future Features
- Payment splitting and tracking
- Additional trip management endpoints (GET, PUT, DELETE)

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

Currently implemented: **`users` domain (COMPLETE - includes authentication)**, **`groups` domain (COMPLETE - full group management)**, **`maps` domain (COMPLETE - Google Places and Routes API integration)** ✅ **NEW**, and **`trips` domain (COMPLETE - trip creation functionality)** ✅ **NEW**. Each domain is self-contained with its own models, schemas, repository, services, routers, dependencies, and utilities. The **auth domain has been eliminated** - all authentication functionality consolidated into the users domain. The maps domain provides address autocomplete and distance calculation functionality using Google Places API v1 and Routes API v2 with Singapore region bias. The trips domain uses a simplified MVP approach where the trip creator is responsible for all costs (no cost splitting), with mocked distance calculation that can be easily replaced with real Google Maps integration.

## Key Implementation Details

### Current Features

#### User Management System (`src/users/`) ✅ **COMPLETE**
- **User Registration**: `POST /users` - Email validation with bcrypt password hashing
- **User Authentication**: `POST /users/login` - JWT-based login with production-ready token system
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

#### Groups System (`src/groups/`) ✅ **COMPLETE**
- **Group Creation**: Complete POST /groups endpoint with authentication
- **Invite Code Generation**: 10-character codes using capital letters (A-Z excluding O,I)
- **Decimal Precision**: Cost per distance uses NUMERIC(10,2) for exact financial calculations
- **Atomic Operations**: Group creation with owner membership in single transaction
- **Repository Pattern**: Clean separation of database operations and business logic
- **Pydantic Integration**: Automatic model validation with Group.model_validate()
- **Dependency Injection**: Service layer with injected repository dependencies

#### Maps System (`src/maps/`) ✅ **NEW - COMPLETE**
- **Google Places API Integration**: Real-time address autocomplete using Google Places API v1
- **Google Routes API integration**: Distance calculation using Google Routes Distance Matrix API v2
- **Address Autocomplete**: `GET /maps/autocomplete` endpoint with Singapore region bias
- **Distance Calculation**: `POST /maps/calculate-distance` endpoint using Place IDs
- **Session Token Support**: Billing optimization for Google Maps API calls
- **Comprehensive Error Handling**: Graceful handling of Google API failures
- **Field Masking**: Optimized API calls requesting only necessary fields
- **Domain Structure**: Complete domain-driven implementation with service, client, and schema layers

#### Trips System (`src/trips/`) ✅ **NEW - COMPLETE**
- **Trip Creation**: `POST /trips` endpoint with group membership validation
- **Creator-Pays Model**: Simplified MVP approach where trip creator is responsible for costs
- **Mocked Distance**: Currently uses 50km mock distance (easily replaceable with real Google Maps integration)
- **JSONB Route Storage**: Flexible storage for trip stops using PostgreSQL JSONB
- **Group Integration**: Automatic validation that user is member of target group
- **Repository Pattern**: Clean separation of database operations and business logic
- **Database Relations**: Proper foreign key relationships with users and groups tables

#### Database Setup
- **Alembic integration**: Database migrations with users, groups, and trips tables created
- **SQLAlchemy 2.0**: Modern ORM with declarative base
- **PostgreSQL connection**: Proper session management
- **Docker Compose setup**: Local development database

### Future Features
- Additional trip management endpoints (GET, PUT, DELETE operations)
- Integration of real Google Maps distance calculation with trip creation
- Cost calculation and payment tracking
- Payment splitting features

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
- `GOOGLE_MAPS_API_KEY`: Google Maps API key for Places and Routes APIs (required) ✅ **UPDATED**
- `GOOGLE_MAPS_REGION_CODE`: Country code for address bias and routing (default: SG for Singapore)

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
- `httpx==0.25.2`: HTTP client for testing and Google Maps API calls ✅ **UPDATED**
- `email-validator==2.1.0`: Email validation support



## Trips Domain Implementation Status ✅ **COMPLETE**

### **POST /trips Endpoint Implementation** ✅ **IMPLEMENTED**

#### **Endpoint Design** ✅ **IMPLEMENTED**
- **Method**: `POST /trips` (implemented)
- **Purpose**: Create a new trip with mocked distance (50km) - ready for Google Maps integration
- **Authentication**: Required (JWT token) ✅ **IMPLEMENTED**
- **Authorization**: User must be a member of the target group ✅ **IMPLEMENTED**

#### **Request Schema** ✅ **IMPLEMENTED**
```python
class CreateTrip(BaseModel):
    group_id: int
    name: str  # e.g., "Weekend Beach Trip"
    description: Optional[str] = None
    stops: List[Dict[str, Any]]  # Route waypoints stored as JSONB
    # total_distance - currently mocked as 50km, ready for Google Maps integration
```

#### **Stops Data Structure**
```python
# Example stops format with addresses:
stops = [
    {"address": "123 Main St, City", "type": "start"},
    {"address": "456 Oak Ave, City", "type": "waypoint"},
    {"address": "789 Beach Rd, City", "type": "end"}
]
# Or with coordinates:
stops = [
    {"lat": 40.7128, "lng": -74.0060, "address": "NYC", "type": "start"},
    {"lat": 40.6892, "lng": -74.0445, "address": "Statue of Liberty", "type": "end"}
]
```

#### **Business Logic Flow** ✅ **IMPLEMENTED**
1. **Authentication**: Verify JWT token → get current user ✅ **IMPLEMENTED**
2. **Authorization**: Check user is member of the specified group ✅ **IMPLEMENTED**
3. **Validation**:
   - Group exists and user has access ✅ **IMPLEMENTED**
   - Stops data structure validation ✅ **IMPLEMENTED**
4. **Distance Calculation**:
   - Currently mocked as 50km ✅ **IMPLEMENTED**
   - Ready for Google Maps Distance Matrix API integration
5. **Cost Calculation**: `total_distance * group.cost_per_distance` (handled by frontend/future feature)
6. **Database**: Create trip with calculated values ✅ **IMPLEMENTED**
7. **Response**: Return created trip with distance and metadata ✅ **IMPLEMENTED**

#### **Implementation Status** ✅ **ALL COMPLETE**
1. **Google Maps Integration**: Available via separate maps domain ✅ **COMPLETE**
2. **Environment Config**: `GOOGLE_MAPS_API_KEY` added to settings ✅ **COMPLETE**
3. **Schemas**: `CreateTrip` schema implemented in `trips/schemas.py` ✅ **COMPLETE**
4. **Repository**: `TripRepository` implemented in `trips/repository.py` ✅ **COMPLETE**
5. **Service**: `TripService` with mocked distance logic in `trips/service.py` ✅ **COMPLETE**
6. **Dependencies**: Group membership validation in `trips/dependencies.py` ✅ **COMPLETE**
7. **Router**: `POST /trips` endpoint implemented in `trips/router.py` ✅ **COMPLETE**
8. **Main App**: Trips router registered in main application ✅ **COMPLETE**

#### **Error Handling** ✅ **IMPLEMENTED**
- Group membership validation ✅ **IMPLEMENTED**
- Invalid trip data validation ✅ **IMPLEMENTED**
- Database constraint handling ✅ **IMPLEMENTED**
- JWT authentication errors ✅ **IMPLEMENTED**

#### **Dependencies** ✅ **AVAILABLE**
- `httpx` for Google Maps API calls (available via maps domain) ✅ **COMPLETE**
- `GOOGLE_MAPS_API_KEY` environment variable ✅ **COMPLETE**

## Next Steps

1. **Integrate Google Maps Distance Calculation**: Replace mocked 50km distance with real Google Maps API calls
2. **Add Additional Trip Endpoints**: GET /trips, GET /trips/{id}, PUT /trips/{id}, DELETE /trips/{id}
3. **Enhanced Frontend Integration**: Connect frontend trip creation with backend POST /trips endpoint
4. **Testing**: Add comprehensive test suite for trips functionality
5. **Deployment**: Prepare for Railway deployment with production environment configuration

## Groups Domain - Implementation Complete ✅

### **Overview** ✅ **COMPLETE**
The Groups domain enables users to create and join car-sharing groups with full implementation complete. Groups use role-based permissions where creators become owners with administrative privileges, while joiners become members with limited permissions.

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

#### **Phase 3: API Endpoints** ✅ **COMPLETE**
1. ✅ Group creation endpoint (POST /groups)
2. ✅ Get user's groups endpoint (GET /groups)
3. ✅ Get group details endpoint (GET /groups/{group_id})
4. ✅ Join group endpoint (POST /groups/join)
5. ✅ Leave group endpoint (POST /groups/{group_id}/leave)
6. ✅ Delete group endpoint (DELETE /groups/{group_id})
7. ✅ Role-based route protection (owners vs members)

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
3. **Register user**: `POST /users` with email/password/first_name
4. **Login**: `POST /users/login` to get JWT token
5. **Authorize**: Click "Authorize" button, enter `Bearer <token>`
6. **Test protected endpoint**: `GET /users/me` to verify authentication works
7. **Test without auth**: Logout and try protected endpoint (should get 401)