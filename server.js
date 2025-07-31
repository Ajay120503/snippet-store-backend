// ------------------------------
// server.js (ESM)
// ------------------------------

// ---- Load environment variables early ----
import dotenv from "dotenv";
dotenv.config();

// ---- Core dependencies ----
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import fetch from "node-fetch";

// ---- Your app code ----
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";

// ---- Connect DB ----
connectDB();

const app = express();
const isProd = process.env.NODE_ENV === "production";

// If using secure cookies behind a proxy (Render, Railway, etc.)
app.set("trust proxy", 1);

// ---- CORS Setup ----
const localOrigins = [
  "http://localhost:5173", // Vite dev
];

const prodOrigins = (
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = isProd ? prodOrigins : localOrigins;

// Optional: Allow Vercel preview deployments
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === "true";
const isVercelPreview = (origin) => {
  try {
    const host = new URL(origin).hostname;
    return /\.vercel\.app$/.test(host);
  } catch {
    return false;
  }
};

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true); // Allow tools like curl/Postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (isProd && allowVercelPreviews && isVercelPreview(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
  })
);

// ---- Parsers ----
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ---- Rate Limiting ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ---- Health Check ----
app.get("/", (_req, res) => {
  res.send("✅ Server is Running...");
});

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);

// ---- Start Server ----
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(
    `[CORS] NODE_ENV=${process.env.NODE_ENV || "development"} | allowedOrigins:`,
    allowedOrigins
  );
});

// ---- CRON: Ping server every 14 minutes ----
const PING_URL = process.env.SELF_URL || `http://localhost:${PORT}`;

cron.schedule("*/14 * * * *", async () => {
  try {
    const res = await fetch(PING_URL);
    const text = await res.text();
    console.log(`[CRON] Pinged ${PING_URL} - ${res.status}: ${text}`);
  } catch (err) {
    console.error(`[CRON] Failed to ping ${PING_URL}`, err.message);
  }
});
