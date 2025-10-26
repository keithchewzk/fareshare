# FareShare Frontend

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. The backend provides user authentication and will expand to include group management and trip tracking functionality.

## Technology Stack

- **Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 7.1.2
- **Styling:** Tailwind CSS 3.4.x with shadcn/ui components
- **Icons:** Lucide React
- **Development:** ESLint for code quality
- **Utilities:** clsx, tailwind-merge, class-variance-authority
- **Navigation:** React Router DOM 7.9.4 for client-side routing
- **Additional Dependencies:** @radix-ui/react-slot, @radix-ui/react-tabs, @radix-ui/react-label, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu

## Code Organization

### Component Structure

The frontend follows a **modular component architecture** using the **Index File Pattern (Option 3)** with **lifted state management**:

```
src/
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx                # Button component with variants
│   │   ├── input.tsx                 # Input field component
│   │   ├── label.tsx                 # Form label component
│   │   ├── card.tsx                  # Card components (Card, CardHeader, etc.)
│   │   ├── tabs.tsx                  # Tabs navigation components
│   │   ├── dialog.tsx                # Modal dialog components
│   │   ├── dropdown-menu.tsx         # Dropdown menu components
│   │   └── address-input.tsx         # Google Maps address autocomplete component
│   ├── LandingPage/                  # Landing page with complete 6-section layout
│   │   └── index.tsx                 # Hero, Features, Use Cases, CTA, Footer
│   ├── AuthPage/                     # Authentication system
│   │   └── index.tsx                 # Login/Signup tabs with mock auth
│   ├── Dashboard/                    # Main dashboard (Index File Pattern)
│   │   ├── index.tsx                 # Dashboard with groups grid & empty state
│   │   ├── CreateGroupDialog.tsx     # Group creation dialog
│   │   └── JoinGroupDialog.tsx       # Group joining dialog with invite codes
│   └── GroupDetails/                 # Group detail pages (NEW)
│       ├── index.tsx                 # Group detail page with trip management
│       └── AddTripDialog.tsx         # Trip creation form (static prototype)
├── lib/
│   ├── utils.ts                     # Utility functions (cn helper)
│   └── routes.ts                    # API routes configuration
├── services/
│   ├── userService.ts               # User registration and authentication API calls
│   ├── groupService.ts              # Group management API calls (NEW)
│   └── mapsService.ts               # Google Maps API integration (NEW)
├── main.tsx                         # Application entry point with React root
├── App.tsx                           # Main app with React Router setup
├── App.css                           # Global app styles
└── index.css                         # Tailwind CSS imports and custom styles
```

### Architecture Principles

**1. Index File Pattern**

- Each major component has its own directory
- Main component is named `index.tsx` for clean imports
- Sub-components use simple, contextual names

**3. Clean Import Paths**

```typescript
// Clean imports thanks to index.tsx pattern
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";

// Internal sub-component imports (within Dashboard directory)
import { CreateGroupDialog } from "./CreateGroupDialog";
import { JoinGroupDialog } from "./JoinGroupDialog";
```

**6. Contextual Naming**

- Sub-components use simple names (`CreateGroupDialog`, `JoinGroupDialog`)
- Context comes from their parent directory location
- Avoids repetitive naming like `DashboardCreateGroupDialog`


## Application Architecture

### Routing & Navigation
- **React Router DOM** - Client-side routing with BrowserRouter
- **Route Structure:**
  - `/` - Landing page with conversion funnel
  - `/auth` - Authentication page (Login/Signup tabs)
  - `/dashboard` - Protected dashboard (requires authentication)
  - `/groups/:groupId` - Group detail page with trip management (protected)

### State Management
- **Local State** - useState for component-level state
- **localStorage Persistence** - Trip data stored locally (groups use backend)
- **Backend State Management** - Groups and memberships managed via API calls

### Data Models
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  invite_code: string;
  cost_per_distance: number;
  distance_unit: 'km' | 'mi';
  created_at: string;
}

interface Membership {
  role: 'owner' | 'member';
  joined_at: string;
}

interface Trip {
  id: string;
  groupId: string;
  userId: string;
  startAddress: string;
  endAddress: string;
  distance: number;
  cost: number;
  date: number;
  paid: boolean;
}
```

## Implementation Progress

### ✅ Completed Features

#### 1. Project Foundation
- **Project Setup:** Vite + React + TypeScript configuration
- **Styling System:** Tailwind CSS 3.4.x + shadcn/ui setup
- **Configuration Files:**
  - `postcss.config.js` - PostCSS with Tailwind + Autoprefixer
  - `tailwind.config.js` - Tailwind configuration with shadcn/ui theme
  - `tsconfig.json` + `tsconfig.node.json` - TypeScript configuration
  - `eslint.config.js` - Modern flat ESLint configuration with React hooks
  - `vite.config.js` - Vite build configuration with React plugin
  - `vite-env.d.ts` - TypeScript declarations for Vite environment
  - `components.json` - shadcn/ui CLI configuration

#### 2. UI Component Library
- **Base Components:** Complete shadcn/ui implementation
  - `src/lib/utils.ts` - Utility functions (cn helper)
  - `src/components/ui/button.tsx` - Button with variants
  - `src/components/ui/input.tsx` - Form input fields
  - `src/components/ui/label.tsx` - Form labels
  - `src/components/ui/card.tsx` - Card components
  - `src/components/ui/tabs.tsx` - Tab navigation
  - `src/components/ui/dialog.tsx` - Modal dialogs

#### 3. Landing Page (Complete)
- **Full 6-Section Layout:** `src/components/LandingPage/index.tsx`
  - Header - Sticky navigation with CTA
  - Hero - Main value proposition
  - Features - 3-column feature grid
  - Use Cases - Target audience section
  - Final CTA - Conversion section
  - Footer - Simple closure
- **Responsive Design** - Mobile-first approach
- **Conversion Funnel** - Awareness → Interest → Consideration → Action

#### 4. Authentication System (Complete - Real Backend Integration)
- **AuthPage Component:** `src/components/AuthPage/index.tsx`
  - Tabbed interface (Login/Signup)
  - Real API integration for registration and login
  - Separate first name/last name fields (first name required)
  - JWT token management and localStorage persistence
  - Loading states and comprehensive error handling
  - React Router integration

#### 5. Dashboard System (Complete)
- **Main Dashboard:** `src/components/Dashboard/index.tsx`
  - User header with logout functionality
  - Action buttons (Create Group, Join Group)
  - Groups grid with statistics
  - Empty state for new users
  - Responsive layout (mobile/tablet/desktop)

#### 6. Group Management (Complete - Real Backend Integration)
- **CreateGroupDialog:** `src/components/Dashboard/CreateGroupDialog.tsx`
  - Group name, description, cost settings
  - Real backend API integration
  - Cost per distance configuration (km/mi)
  - Form validation and error handling
- **JoinGroupDialog:** `src/components/Dashboard/JoinGroupDialog.tsx`
  - Invite code input with backend validation
  - Real-time error handling for invalid codes
  - Successful group joining with backend persistence
  - Form validation and reset

#### 7. Group Details & Trip Management (Complete)
- **GroupDetails:** `src/components/GroupDetails/index.tsx`
  - Complete group detail page with role-based permissions
  - Real backend integration for group data loading
  - Trip history display with mock localStorage data
  - Owner vs Member role distinction with different actions
  - Group management actions: Delete (owners), Leave (members)
  - Invite code display with copy-to-clipboard functionality
  - Loading states and comprehensive error handling
- **AddTripDialog:** `src/components/GroupDetails/AddTripDialog.tsx`
  - **ENHANCED**: Real Google Maps integration for distance calculation ✅ **NEW**
  - Start/End address input with live autocomplete
  - Real-time cost calculation with Google Maps distance API
  - Proper error handling for Maps API failures
  - Ready for backend trip creation integration

#### 8. Google Maps Integration (Complete) ✅ **NEW**
- **AddressInput Component:** `src/components/ui/address-input.tsx`
  - Google Places API autocomplete integration
  - Debounced search with loading states
  - Keyboard navigation support (arrow keys, enter, escape)
  - Place ID tracking for accurate distance calculations
  - Singapore region restriction
  - User-friendly error handling
- **MapsService:** `src/services/mapsService.ts`
  - Address autocomplete suggestions via Google Places API
  - Distance calculation between waypoints
  - Session token support for billing optimization
  - Comprehensive error handling and fallbacks

#### 9. Application Entry Point
- **Main Entry:** `src/main.tsx` - React 19 application bootstrapping
  - Strict mode enabled for development
  - Root element validation and error handling
  - Modern createRoot API usage

#### 10. Backend Integration (Complete)
- **API Client Architecture:** Router & Services pattern
  - `lib/routes.ts` - Centralized API endpoint configuration
  - `services/userService.ts` - User registration and authentication business logic
  - `services/groupService.ts` - Complete group management API integration
  - `services/mapsService.ts` - Google Maps API integration for address autocomplete and distance calculation ✅ **NEW**
  - Environment-based configuration with `VITE_BACKEND_API_URL`
- **Authentication Flow:** ✅ **COMPLETE**
  - User Registration: POST /users → Create account in PostgreSQL database
  - User Login: POST /users/login → JWT token + GET /users/me → User profile
  - Token Management: localStorage persistence with key `fareshare_token`
- **Group Management Flow:** ✅ **COMPLETE**
  - Group Creation: POST /groups → Create group with backend API
  - Group Listing: GET /groups → Load user's groups from backend
  - Group Details: GET /groups/{id} → Load specific group data
  - Group Joining: POST /groups/join → Join via invite code
  - Group Actions: DELETE /groups/{id}, POST /groups/{id}/leave
  - Membership Roles: GET /groups/{id}/membership → Owner vs Member permissions
- **Error Handling:** Comprehensive API error handling with user-friendly messages
- **Loading States:** Visual feedback during API operations

#### 11. Data Persistence
- **localStorage Integration:**
  - JWT tokens stored in `fareshare_token` (real authentication)
  - Trip data stored in `fareshare_trips` (mock data for UI)
- **Backend Persistence:**
  - User accounts stored in PostgreSQL via FastAPI
  - Groups and memberships stored in PostgreSQL via FastAPI
  - Role-based permissions managed by backend

### ✅ Application Flow
1. **Landing Page** - User discovers FareShare
2. **Authentication** - Real backend integration:
   - **Registration:** User creates account → Stored in PostgreSQL database
   - **Login:** User authenticates → JWT token + user profile → Dashboard
3. **Dashboard** - User views their groups (real backend data)
4. **Group Creation** - User creates new shared vehicle group (real backend functionality)
5. **Group Joining** - User joins existing groups via invite codes (real backend functionality)
6. **Group Management** - User views group details with role-based permissions (real backend functionality)
7. **Group Details** - User navigates to detailed group view:
   - **Trip History:** View all trips for the group (mock localStorage data)
   - **Group Actions:** Delete group (owners) or leave group (members)
   - **Invite Code:** Copy group invite code to clipboard
8. **Trip Management** - Real Google Maps integration for trip creation ✅ **ENHANCED**:
   - **Address Autocomplete:** Real-time address suggestions using Google Places API
   - **Distance Calculation:** Automatic distance calculation between waypoints
   - **Cost Calculation:** Real-time trip cost calculation based on distance
   - **Trip Creation:** Ready for backend integration (UI complete)

### 📋 Ready for Enhancement
- **Trip Backend Integration:** Connect AddTripDialog to backend trip creation endpoint (Google Maps distance calculation already complete)
- **Advanced trip features:** Trip editing, deletion, and payment status tracking
- **Member management:** View group members, manage member permissions
- **Token refresh and session management:** Enhanced authentication security
- **Mobile app considerations:** Responsive design improvements
- **Real-time updates:** WebSocket integration for live group updates

### Technical Decisions
- **Tailwind CSS 3.x** - Chosen over 4.x for stability with shadcn/ui
- **Manual component installation** - Used due to CLI network issues
- **Index File Pattern** - Consistent component organization
- **Router & Services Architecture** - Clean separation of API routes and business logic
- **Environment Configuration** - Vite environment variables for API URL configuration
- **JWT Authentication** - Industry-standard token-based authentication
- **Consolidated API Endpoints** - All user operations under `/users` (POST /users, POST /users/login, GET /users/me)
- **Google Maps Integration** - Real-time address autocomplete and distance calculation via Google Places API
- **Hybrid Data Approach** - Real authentication and groups with mock trip data (transitional)