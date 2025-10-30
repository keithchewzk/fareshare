# FareShare

<div align="center">
  <a href="https://github.com/keithchewzk/fareshare">
    <img src="frontend/public/fareshare.svg" alt="Logo" width="120" height="120">
  </a>

<h3 align="center">FareShare</h3>

<p align="center">
  Collaborative car usage tracking made simple. Track, split, and settle shared vehicle expenses fairly with your group.
</p>
</div>

<details>
<summary>Table of Contents</summary>
<ol>
<li><a href="#about-the-project">About The Project</a>
  <ul>
    <li><a href="#core-features">Core Features</a></li>
    <li><a href="#built-with">Built With</a></li>
  </ul>
</li>
<li><a href="#getting-started">Getting Started</a>
  <ul>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#environment-setup">Environment Setup</a></li>
    <li><a href="#running-the-project">Running The Project</a></li>
  </ul>
</li>
<li><a href="#usage">Usage</a></li>
<li><a href="#roadmap">Roadmap</a></li>
<li><a href="#contact">Contact</a></li>
</ol>
</details>

## About The Project

**FareShare** is a web application designed to simplify and automate shared car expense tracking. Whether you’re managing a family vehicle, carpooling with colleagues, or sharing a car with friends, FareShare keeps everyone’s trips, costs, and settlements transparent and fair.

### Core Features

- **User Accounts & Authentication:** Secure login and registration system with session persistence.
- **Group Management:** Create, join, and manage car-sharing groups with unique invite codes.
- **Trip Logging:** Record start and end locations, automatically calculate distance using Google Maps API, and assign trip costs.
- **Expense Splitting:** View and settle shared costs automatically between group members.
- **Trip Settlement System:** Integrated settlement tracking to mark and confirm payments.
- **Google Maps Integration:** Dynamic address autocomplete, route visualization, and accurate cost estimation.
- **Responsive UI:** Built with modern, minimal UI using Tailwind CSS and shadcn/ui.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

#### Frontend

[![React][React.js]][React-url] [![Vite][Vite.js]][Vite-url] [![TypeScript][TypeScript.js]][TypeScript-url]

#### Backend 

[![Python][Python.js]][Python-url] [![FastAPI][FastAPI.js]][FastAPI-url] [![Docker][Docker.js]][Docker-url] [![PostgreSQL][PostgreSQL.js]][PostgreSQL-url] [![Google Maps API][GoogleMaps.js]][GoogleMaps-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

FareShare is currently **deployed on [Railway](https://railway.app)** and accessible live at:

👉 **[https://fareshare.up.railway.app/](https://fareshare.up.railway.app/)**

You can try out the app directly from your browser — no setup required.  
For local development, follow the steps below to run the project manually.

### Prerequisites

Before running FareShare locally, ensure you have installed:

- **Node.js** and **npm** (for the frontend)
- **Python 3.11+** and **pip**
- **PostgreSQL**
- **Google Maps API key**

### Environment Setup

Create environment files for both the frontend and backend with your keys and local configuration.

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:8000
```

**Backend `.env`:**

```env
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/fareshare
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SECRET_KEY=your_secret_key
```

### Running The Project

#### Option 1: Manual Setup

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Access the app at: `http://localhost:5173`

#### Option 2: Docker Compose (coming soon)

A Docker Compose setup will be added to streamline development and deployment.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Once you’re logged in, you can:

1. **Create or join a group** using an invite code.
2. **Log trips** with start and end points — costs are calculated automatically.
3. **View all trips** in your group dashboard.
4. **Settle balances** transparently between members.

### Typical User Flow

1. User signs up and creates a group (e.g., “Office Carpool”).
2. Other members join using the group’s invite code.
3. Members log each trip they take.
4. The system calculates distances, costs, and fair shares automatically.
5. Settlement dashboard shows who owes what.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] User authentication
- [x] Group creation and management
- [x] Trip logging and automatic cost calculation
- [x] Settlement tracking system
- [x] Google Maps integration
- [ ] React Query integration
- [ ] Decompose FE components into smaller sub-components for better code readability and fewer re-renders
- [ ] Removal of group members by group owners
- [ ] Refresh token capability for authentication

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

[![LinkedIn][LinkedIn.badge]][LinkedIn.url] [![GitHub][GitHub.badge]][GitHub.url] [![Email][Email.badge]][Email.url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


[GoogleMaps.js]: https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white
[GoogleMaps-url]: https://developers.google.com/maps
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[TypeScript.js]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Python.js]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[FastAPI.js]: https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi
[FastAPI-url]: https://fastapi.tiangolo.com/
[Docker.js]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[PostgreSQL.js]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[GoogleMaps.js]: https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white
[GoogleMaps-url]: https://developers.google.com/maps
[LinkedIn.badge]: https://img.shields.io/badge/-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[LinkedIn.url]: https://www.linkedin.com/in/keithchewzikai
[GitHub.badge]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[GitHub.url]: https://github.com/keithchewzk
[Email.badge]: https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white
[Email.url]: mailto:keithchewzk@gmail.com
