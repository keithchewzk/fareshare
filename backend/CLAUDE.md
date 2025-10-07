# FareShare Backend - Technical Overview

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. The backend provides user authentication and will expand to include group management and trip tracking functionality.

**Current Status**: Core authentication system implemented with JWT-based security. User registration and login functionality complete with production-ready bcrypt password hashing. Ready for groups and trips domain implementation.

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
│   └── users/             # User domain
│       ├── models.py      # User database models (with first_name/last_name)
│       ├── schemas.py     # Pydantic schemas for validation
│       ├── repository.py  # User database operations
│       ├── service.py     # User business logic with bcrypt
│       ├── router.py      # User API endpoints
│       ├── dependencies.py # Dependency injection
│       └── __init__.py    # User module init
├── alembic/               # Database migration tools
│   └── versions/          # Migration files (users table created)
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

### Future Implementation
Additional tables for groups, trips, and related functionality will be added after authentication is complete.

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

Currently implemented: `users` and `auth` domains. Each domain is self-contained with its own models, schemas, repository, services, routers, and dependencies. Ready to add `groups` and `trips` domains following the same architectural pattern.

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

## Authentication Testing

### Complete Flow Testing with Swagger UI

1. **Start server**: `uvicorn src.main:app --reload`
2. **Open Swagger UI**: `http://localhost:8000/docs`
3. **Register user**: `POST /users` with email/password
4. **Login**: `POST /auth/login` to get JWT token
5. **Authorize**: Click "Authorize" button, enter `Bearer <token>`
6. **Test protected endpoint**: `GET /auth/me` to verify authentication works
7. **Test without auth**: Logout and try protected endpoint (should get 401)