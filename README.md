# GharSeva

GharSeva is a full-stack domestic helper discovery and verification platform built for households, helpers, and admins. Families can browse trusted helpers, save profiles, and send booking requests. Helpers can create verified profiles with live photos and PDF identity documents. Admins can review applications, approve trusted profiles, and remove rejected ones from the system.

## What the app does

### For households
- Browse approved helpers by city, service, and budget
- Open helper profile cards and view service details
- Save helpers to a shortlist
- Send booking requests
- Track active requests and booking history from the user dashboard

### For helpers
- Sign up as a helper
- Complete a verification profile with personal details, work details, pricing, live photo, and PDF verification documents
- Resubmit the profile after edits
- Track incoming booking requests from the helper dashboard

### For admins
- Log in through the admin access flow
- Review pending helper profiles
- Open uploaded PDF documents directly in the dashboard
- Inspect live photos before approval
- Approve helpers to make them visible on the platform
- Reject helpers and remove them from both UI and backend records
- Monitor users and approved helper listings

## Tech stack

### Frontend
- React 18
- Vite
- Axios
- Plain CSS with a custom design system

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Google Sign-In support
- Helmet, CORS, and rate limiting

## Main features implemented
- Role-based authentication for `user`, `helper`, and `admin`
- Admin signup protection with `ADMIN_INVITE_CODE`
- Admin seeding script for bootstrapping the first admin account
- Helper approval workflow
- Real PDF document uploads for verification
- Live helper photo upload during profile submission
- Saved helpers and shortlist flow
- Booking request lifecycle
- Ratings support
- Separate dashboards for user, helper, and admin
- Modern responsive UI theme across the app

## Project structure

```text
ghar-seva/
|-- client/                 # React + Vite frontend
|   `-- src/
|       |-- api/            # Axios API helpers
|       |-- components/     # Reusable UI components
|       |-- context/        # Shared app state
|       |-- data/           # Local fallback data
|       |-- pages/          # Home, auth, browse, register, dashboards
|       |-- styles/         # Global theme and design system
|       `-- utils/          # PDF/document helpers
|-- server/                 # Express + MongoDB backend
|   |-- config/             # Database connection
|   |-- controllers/        # Route controller logic
|   |-- middleware/         # Auth middleware
|   |-- models/             # Mongoose schemas
|   |-- routes/             # API routes
|   |-- index.js            # Server entry point
|   `-- seedAdmin.js        # Admin bootstrap script
|-- package.json            # Root dev scripts
`-- .gitignore
```

## Local setup

### 1. Clone the repository
```bash
git clone https://github.com/Sajalkhare07/Ghar-seva-F-ind-house-help-.git
cd Ghar-seva-F-ind-house-help-
```

### 2. Install dependencies
Install root, client, and server dependencies.

```bash
npm install
cd client
npm install
cd ../server
npm install
```

### 3. Create environment files
Create a `server/.env` file and add your backend configuration.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLIENT_URL_ALT=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
ADMIN_INVITE_CODE=your_admin_invite_code
ADMIN_SEED_NAME=Admin
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=your_admin_password
```

If you use Google sign-in on the frontend, create `client/.env` as needed for your Google client configuration.

## Running the app

### Recommended: start frontend and backend together
From the root folder:

```bash
npm run dev
```

This starts:
- backend on `http://localhost:5000`
- frontend on `http://localhost:5173`

### Start them separately
Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Admin setup

You have two ways to access admin functionality.

### Option 1: seed the first admin account
From the `server` folder:

```bash
npm run seed:admin
```

Then log in using:
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`

### Option 2: create an admin with invite code
Use the admin access flow in the app and sign up with:
- a valid email and password
- the `ADMIN_INVITE_CODE` from `server/.env`

## API overview

### Auth routes
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `GET /api/auth/saved-helpers`
- `POST /api/auth/toggle-saved-helper`

### Helper routes
- `GET /api/helpers`
- `GET /api/helpers/:id`
- `GET /api/helpers/me/profile`
- `POST /api/helpers`
- `PUT /api/helpers/:id`
- `DELETE /api/helpers/:id`

### Booking routes
- Booking creation and status update routes support the user and helper workflow

### Rating routes
- Rating creation and fetch routes

### Admin routes
- `GET /api/admin/overview`
- `PUT /api/admin/helpers/:id/review`

## Current workflow summary

### Household flow
1. Sign up or log in
2. Browse approved helpers
3. Save profiles to shortlist
4. Send booking requests
5. Track updates in the dashboard

### Helper flow
1. Sign up as helper
2. Complete the verification profile
3. Upload live photo and PDF documents
4. Wait for admin review
5. Receive bookings after approval

### Admin flow
1. Log in through admin access
2. Open the pending helper queue
3. Review live photo and PDF documents
4. Approve or reject helper applications
5. Monitor user and helper accounts

## Security and validation
- JWT-based protected routes
- Role-aware backend authorization
- CORS allowlist configuration
- Rate limiting on auth and API routes
- Helmet security headers
- Helper verification validation for required fields and PDF documents

## Scripts

### Root
```bash
npm run dev
npm run dev:server
npm run dev:client
```

### Client
```bash
npm run dev
npm run build
npm run preview
```

### Server
```bash
npm run dev
npm start
npm run seed:admin
```

## Roadmap ideas
- Request-changes flow for helper verification
- Notification system for booking and review updates
- Stronger mobile-first polish
- Persistent file storage for images and PDFs
- Richer filtering and analytics for admins

## Notes
- Uploaded verification PDFs are currently handled directly in the app flow for admin review.
- Rejected helper profiles are removed from both UI and backend records.
- Approved helper listings are the only profiles shown in browse results.

## Author
Built by Sajal and collaborators.