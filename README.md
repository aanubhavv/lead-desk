# LeadDesk

A full-stack, B2B lead-capture and management application tailored for a web, Shopify, and mobile app development agency.

The project is split into two distinct parts:
- **Public B2B Funnel (`/`)**: A high-conversion landing page designed to build trust (through client logos, statistics, and testimonials) and qualify incoming leads via a submission form.
- **Admin Dashboard (`/admin`)**: A secure, authenticated dashboard for agency owners to view, search, paginate, and manage the status (New, Contacted, Closed) of submitted leads.

## Live Demo

- **Deployed Frontend (Vercel)**: https://lead-desk-vert-two.vercel.app/
- **Deployed Backend (Render)**: https://lead-desk-ks9w.onrender.com
- **Database**: MongoDB Atlas

**Admin Login Credentials for Testing:**
- **Username**: `admin`
- **Password**: `123456`

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 (with custom CSS animations and glassmorphism effects)

### Backend
- **Framework**: FastAPI (Python)
- **Database Driver**: Motor (Async MongoDB Driver)
- **Validation & Serialization**: Pydantic v2
- **Authentication**: `python-jose` (for JWT generation/verification) and `bcrypt` (for password hashing)
- **Server**: Uvicorn

### Database
- **MongoDB**: Used as the primary data store (NoSQL).

---

## Project Structure

The repository is divided into two primary directories:

```
lead-desk/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # Next.js App Router (page.tsx for public funnel, admin/ for dashboard)
│   │   ├── components/       # Reusable React components (UI elements, LeadForm, LeadTable)
│   │   │   └── landing/      # Landing page specific sections (Hero, Services, Testimonials, etc.)
│   │   └── lib/              # API utilities, frontend types, and fetch wrappers
│   ├── public/               # Static assets (images, icons)
│   └── package.json          # Node.js dependencies
│
└── backend/                  # FastAPI application
    ├── app/
    │   ├── main.py           # FastAPI application entry point and CORS setup
    │   ├── routers/          # API route definitions (auth.py, leads.py)
    │   ├── models/           # Pydantic schemas (user.py, lead.py) mapping to MongoDB documents
    │   ├── services/         # Business logic (auth_service.py, lead_service.py)
    │   ├── database.py       # MongoDB connection lifespan management
    │   └── exceptions.py     # Global exception handlers
    ├── scripts/
    │   └── seed_admin.py     # CLI script to securely create the first admin user
    └── requirements.txt      # Python dependencies
```

---

## Data Model

The application uses MongoDB to store two primary collections: `leads` and `users`.

### `leads` Collection
Stores incoming contact requests from the landing page funnel.
- `_id` (ObjectId): Auto-generated unique identifier.
- `name` (String): Full name of the prospect.
- `email` (String): Prospect's email address.
- `budget_range` (String): Selected budget (must be one of the predefined `BudgetRange` enum values, e.g., "Under $1,000", "$10,000 – $25,000").
- `message` (String): Project details.
- `status` (String): Current lead status (Enum: `New`, `Contacted`, `Closed`). Defaults to `New`.
- `created_at` (Datetime): UTC timestamp of submission. Useful for sorting new leads.
- `updated_at` (Datetime): UTC timestamp of the last status update.

*(Note: While the frontend form includes an optional `project_type` field to reduce friction, this field is currently discarded by the backend's strict Pydantic model and is not stored in MongoDB.)*

### `users` Collection
Stores administrative users who have access to the dashboard.
- `_id` (ObjectId): Auto-generated unique identifier.
- `username` (String): The admin's login identifier.
- `hashed_password` (String): The bcrypt hash of the admin's password. **Plaintext passwords are never stored in the database.**
- `created_at` (Datetime): UTC timestamp of account creation.

### `token_blacklist` Collection
Stores revoked JWT tokens (JTIs) to prevent reuse upon logout or refresh token rotation.
- `jti` (String): The unique JWT ID.
- `expires_at` (Datetime): When the token naturally expires. A MongoDB TTL index is usually applied here to automatically prune expired tokens from the blacklist.

---

## Authentication Approach

The application uses **stateless JWT (JSON Web Token) authentication** combined with bcrypt password hashing, avoiding the severe security risks associated with hardcoded credentials in source code.

1. **Admin Creation**: Admin accounts are not hardcoded. They are generated via a secure CLI script (`python -m scripts.seed_admin`). This script interactively prompts for a username and password, hashes the password using `bcrypt` (with an automatically generated salt), and stores the record in MongoDB.
2. **Login Flow**: When an admin submits credentials to `/auth/login`, the backend retrieves the user by username and uses `bcrypt.checkpw()` to verify the provided plaintext password against the stored hash.
3. **Token Issuance**: Upon successful verification, the backend issues two tokens:
   - A short-lived **access token** (e.g., 30 minutes).
   - A long-lived **refresh token** (e.g., 7 days).
   These are returned to the client and stored in local state (or localStorage on the frontend).
4. **Route Protection**: Protected endpoints (like `/leads` GET and `/leads/{id}` PATCH) require the access token to be passed in the `Authorization: Bearer <token>` header. A FastAPI dependency (`get_current_admin`) decodes the JWT, verifies its signature using a secret key, checks expiration, and ensures the token hasn't been blacklisted. Invalid/missing tokens return a `401 Unauthorized` status.
5. **Logout & Blacklisting**: When a user logs out via `/auth/logout`, the active token's unique `jti` (JWT ID) is inserted into a MongoDB blacklist collection. The authorization dependency checks this blacklist on every request, rendering the logged-out token immediately invalid even before its natural expiration time.

---

## API Endpoints Reference

| Method | Path | Auth Required | Request Body | Description |
|---|---|---|---|---|
| **POST** | `/leads` | No | `LeadCreate` (name, email, budget_range, message) | Submits a new lead from the public landing page. Returns the created `LeadResponse`. |
| **GET** | `/leads` | **Yes** | *Query params*: `search`, `page`, `page_size`, `sort_by`, `sort_order` | Lists leads for the dashboard with pagination and search. Returns `LeadListResponse`. |
| **GET** | `/leads/{id}` | **Yes** | None | Retrieves details for a specific lead. |
| **PATCH** | `/leads/{id}` | **Yes** | `LeadStatusUpdate` (status) | Updates a lead's status (New/Contacted/Closed). |
| **POST** | `/auth/login` | No | `LoginRequest` (username, password) | Authenticates an admin and returns access and refresh tokens. |
| **POST** | `/auth/refresh` | No | `RefreshRequest` (refresh_token) | Exchanges a valid refresh token for a new token pair and blacklists the old refresh token. |
| **POST** | `/auth/logout` | **Yes** | None | Blacklists the current access token to invalidate the session. |
| **GET** | `/auth/me` | **Yes** | None | Returns the currently authenticated admin's user info. |

---

## Environment Variables

### Frontend (`frontend/.env.local`)
| Variable | Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | The base URL of the FastAPI backend. Must NOT have a trailing slash. | `http://localhost:8000` |

### Backend (`backend/.env`)
| Variable | Description | Example Value |
|---|---|---|
| `MONGODB_URI` | Connection string for the MongoDB instance. | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | The database name to use within MongoDB. | `leaddesk` |
| `JWT_SECRET_KEY` | A long, random cryptographic string used to sign JWTs. | `change-me-to-a-long-random-secret-string` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Lifespan of the short-lived access token. | `30` |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Lifespan of the refresh token. | `7` |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins for CORS. | `http://localhost:3000` |

---

## Setup and Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB instance (local or Atlas)

### 1. Database Setup
Ensure MongoDB is running locally on port 27017, or obtain an Atlas connection string.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (if it exists, otherwise create one):
   ```bash
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create the `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *(Edit `.env` to set a secure `JWT_SECRET_KEY` and update `MONGODB_URI` if necessary).*
5. Create the first admin user:
   ```bash
   python -m scripts.seed_admin
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
4. Start the Next.js development server using Turbopack:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## Known Limitations / Notes

- **`project_type` field**: The frontend lead form includes an optional project type selector (e.g., "Website", "Shopify App"). This data is sent in the payload but currently discarded by the backend because the `LeadCreate` Pydantic model does not define it. To persist this, the backend model and insert logic must be updated.
- **Frontend Validation**: Form validation is strictly client-side and relies on native HTML5 constraints and custom React logic rather than a heavy library like Zod/React-Hook-Form.
- **No Email Notifications**: Leads are captured directly into the database. There is no automated email notification system implemented for new submissions.
- **No Rate Limiting**: The public `/leads` POST endpoint does not currently implement rate limiting, which could be a consideration for a production deployment to prevent spam.
- **Session Persistence**: JWTs are currently stored client-side. The implementation does not utilize HTTPOnly cookies.
