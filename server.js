// server.js (ESM)
// ------------------------------
// Load environment variables early
import dotenv from "dotenv";
dotenv.config();

// Core deps
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// Your app code
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";

// ---- Connect DB ----
connectDB();

const app = express();
const isProd = process.env.NODE_ENV === "production";

// If you set secure cookies behind a proxy (Render, Railway, Nginx, etc.)
app.set("trust proxy", 1);

// ---- CORS (env-aware) ----
// In production, set FRONTEND_URLS (comma separated) or FRONTEND_URL (single).
// In development, we default to localhost:5173 (Vite).
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


// Helper: allow *.vercel.app previews if enabled
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
      // Allow non-browser tools (no Origin), e.g., curl/Postman
      if (!origin) return callback(null, true);

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

// ---- Rate limiter ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ---- Health check ----
app.get("/", (_req, res) => {
  res.send("✅ Server is Running...");
});

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);

// ---- Start server ----
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(
    `[CORS] NODE_ENV=${process.env.NODE_ENV || "development"} | allowedOrigins:`,
    allowedOrigins
  );
});