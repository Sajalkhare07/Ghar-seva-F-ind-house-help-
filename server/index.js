const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_ALT,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Too many authentication attempts. Please try again later.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Too many requests. Please slow down and try again later.",
  },
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/helpers", require("./routes/helperRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "GharSeva API is running", status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ msg: "Request blocked by CORS policy" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ msg: "Invalid resource id" });
  }

  if (err.code === 11000) {
    return res.status(400).json({ msg: "Duplicate value found" });
  }

  res.status(500).json({
    msg: "Internal server error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`GharSeva server running on http://localhost:${PORT}`);
});
