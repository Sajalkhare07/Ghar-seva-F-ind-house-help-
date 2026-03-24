# 🏠 GharSeva

> Find trusted maids, cooks & domestic helpers near you — built for bachelors and working professionals in Indian cities.

---

## 📁 Project Structure

```
gharseva/
├── client/                          ← React + Vite frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js             ← All axios API calls
│   │   ├── components/
│   │   │   ├── Avatar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HelperCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── Stars.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx       ← Global state (optional)
│   │   ├── data/
│   │   │   └── helpers.js           ← Sample data + constants
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── styles/
│   │   │   └── globals.css          ← All global CSS
│   │   ├── App.jsx                  ← Root component + page router
│   │   └── main.jsx                 ← React DOM entry point
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          ← Node.js + Express backend
│   ├── config/
│   │   └── db.js                    ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        ← Signup / Login / Me
│   │   ├── bookingController.js     ← Booking CRUD
│   │   └── helperController.js      ← Helper CRUD
│   ├── middleware/
│   │   └── authMiddleware.js        ← JWT protect + role guard
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Helper.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── helperRoutes.js
│   ├── .env
│   ├── index.js                     ← Express app entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- npm or yarn

---

### 1. Clone / Download & open in VS Code

```bash
cd gharseva
code .
```

---

### 2. Setup the Backend

```bash
cd server
npm install
```

Edit `server/.env` if needed:
```
MONGO_URI=mongodb://localhost:27017/gharseva
JWT_SECRET=your_secret_key_here
PORT=5000
```

Start the server:
```bash
npm run dev        # development (nodemon — auto-restarts)
# OR
npm start          # production
```

Server runs on → **http://localhost:5000**

---

### 3. Setup the Frontend

Open a **second terminal**:

```bash
cd client
npm install
npm run dev
```

Frontend runs on → **http://localhost:5173**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Description         | Auth? |
|--------|--------------------|---------------------|-------|
| POST   | /api/auth/signup   | Register new user   | ❌    |
| POST   | /api/auth/login    | Login               | ❌    |
| GET    | /api/auth/me       | Get current user    | ✅    |

### Helpers
| Method | Endpoint           | Description               | Auth? |
|--------|--------------------|---------------------------|-------|
| GET    | /api/helpers       | List all (with filters)   | ❌    |
| GET    | /api/helpers/:id   | Single helper profile     | ❌    |
| POST   | /api/helpers       | Register as helper        | ❌    |
| PUT    | /api/helpers/:id   | Update helper profile     | ✅    |
| DELETE | /api/helpers/:id   | Delete helper profile     | ✅    |

### Bookings
| Method | Endpoint                        | Description                | Auth? |
|--------|---------------------------------|----------------------------|-------|
| POST   | /api/bookings                   | Send booking request       | ✅    |
| GET    | /api/bookings/mine              | My bookings (as user)      | ✅    |
| GET    | /api/bookings/helper-requests   | Requests received (helper) | ✅    |
| PATCH  | /api/bookings/:id/status        | Accept / Reject booking    | ✅    |

---

## 🧪 Test the API (Thunder Client / Postman)

**Signup:**
```json
POST http://localhost:5000/api/auth/signup
{
  "name": "Rohan Mehta",
  "email": "rohan@example.com",
  "password": "password123",
  "role": "user"
}
```

**Login:**
```json
POST http://localhost:5000/api/auth/login
{
  "email": "rohan@example.com",
  "password": "password123"
}
```

**Get helpers (with filters):**
```
GET http://localhost:5000/api/helpers?city=Indore&service=Maid&maxPrice=4000
```

**Add a helper:**
```json
POST http://localhost:5000/api/helpers
{
  "name": "Sunita Devi",
  "phone": "9876543210",
  "service": "Maid",
  "price": 3500,
  "city": "Indore",
  "area": "Vijay Nagar",
  "availability": "Morning (6-10 AM)",
  "about": "Experienced and punctual."
}
```

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, CSS Variables     |
| Styling    | Custom CSS (glassmorphism design) |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| HTTP       | Axios (frontend → backend)        |

---

## 🎨 Design System

| Token         | Value                               |
|---------------|-------------------------------------|
| Background    | `#080810`                           |
| Surface       | `#0e0e1a`                           |
| Accent Blue   | `#4f8ef7`                           |
| Accent Purple | `#9b5cff`                           |
| Green         | `#00e5a0`                           |
| Gradient      | `135deg, #4f8ef7 → #9b5cff`         |
| Font Display  | Syne (headings)                     |
| Font Body     | DM Sans (body text)                 |
| Border Radius | `16px` (cards), `50px` (buttons)    |

---

## 📦 Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** — `dsznajder.es7-react-js-snippets`
- **Tailwind CSS IntelliSense** — `bradlc.vscode-tailwindcss`
- **Prettier** — `esbenp.prettier-vscode`
- **MongoDB for VS Code** — `mongodb.mongodb-vscode`
- **Thunder Client** — `rangav.vscode-thunder-client`
- **Auto Rename Tag** — `formulahendry.auto-rename-tag`
- **GitLens** — `eamodio.gitlens`

---

## 🌐 Deploying

### Frontend → Vercel
```bash
cd client
npm run build
# Upload dist/ to Vercel or run: npx vercel
```

### Backend → Render / Railway
1. Push `server/` to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set environment variables from `server/.env`
4. Build command: `npm install`  |  Start command: `npm start`

### Database → MongoDB Atlas (free tier)
1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Get the connection string
3. Replace `MONGO_URI` in `server/.env`

---

## ✅ Checklist Before Running

- [ ] MongoDB running locally (`mongod`) OR Atlas URI set in `.env`
- [ ] `server/.env` file has correct `MONGO_URI` and `JWT_SECRET`
- [ ] `client/.env` has `VITE_API_URL=http://localhost:5000/api`
- [ ] Both terminals open — one for server, one for client
- [ ] `npm install` done in both `client/` and `server/`

---

Made with ❤️ for bachelors across India 🇮🇳