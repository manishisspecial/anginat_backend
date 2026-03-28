const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const leadRoutes = require("./routes/leadRoutes");
const instituteRouter = require("./routes/instituteRoutes");
const accessControlRoutes = require("./routes/accessControlRoutes");
const featureManagementRoutes = require("./routes/featureManagementRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const roleRoutes = require("./routes/roleRoutes");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const staticAllowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:5172",
  "http://localhost:5173",
  "https://anginat-frontend.vercel.app",
  "https://www.anginatlearning.com",
  "https://anginatlearning.com",
  "https://anginatevents.com",
  "https://main.d2p986kto1ef06.amplifyapp.com",
  "https://admin.anginatlearning.com",
  "https://www.springlearns.com",
  "https://testing.d2uojw7xfu916c.amplifyapp.com",
  "https://ravneet.de9ljefa2nzpw.amplifyapp.com",
  "https://main.d336rzhcy31fea.amplifyapp.com",
  "https://screenshiksha.com",
];

const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...staticAllowedOrigins, ...envAllowedOrigins]),
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------------------------------------------------------------------------
// Proxy course + student APIs to the legacy student API.
// The proxy forwards Authorization headers so the external API can authenticate.
// ---------------------------------------------------------------------------
const externalStudentApiOrigin =
  process.env.EXTERNAL_STUDENT_API_ORIGIN ||
  "https://studentapi.anginatlearning.com";

const proxyErrorHandler = (err, req, res) => {
  console.error(`Proxy error [${req.method} ${req.originalUrl}]:`, err.message);
  if (!res.headersSent) {
    res.status(502).json({
      success: false,
      message: "Upstream service is temporarily unavailable",
    });
  }
};

app.use(
  "/api/course",
  createProxyMiddleware({
    target: externalStudentApiOrigin,
    changeOrigin: true,
    secure: true,
    pathRewrite: (path) => `/api/course${path}`,
    on: { error: proxyErrorHandler },
  })
);
app.use(
  "/api/student",
  createProxyMiddleware({
    target: externalStudentApiOrigin,
    changeOrigin: true,
    secure: true,
    pathRewrite: (path) => `/api/student${path}`,
    on: { error: proxyErrorHandler },
  })
);

// ---------------------------------------------------------------------------
// Body parsing & middleware
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/institute", instituteRouter);
app.use("/api/rbac/access-control", accessControlRoutes);
app.use("/api/rbac/feature", featureManagementRoutes);
app.use("/api/rbac/permission", permissionRoutes);
app.use("/api/rbac/subscription", subscriptionRoutes);
app.use("/api/roles", roleRoutes);

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;
