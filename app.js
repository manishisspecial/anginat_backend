const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
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
const connectDatabase = require("./config/database");
const { createProxyMiddleware } = require("http-proxy-middleware");
dotenv.config();
const app = express();
connectDatabase();

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
  "https://screenshiksha.com"
];

const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...staticAllowedOrigins, ...envAllowedOrigins])];

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

// Proxy course + student APIs to the legacy public API (same paths under /api).
// Keeps the admin frontend on one origin and avoids browser CORS to studentapi.
const externalStudentApiOrigin =
  process.env.EXTERNAL_STUDENT_API_ORIGIN || "https://studentapi.anginatlearning.com";
const apiProxy = createProxyMiddleware({
  target: externalStudentApiOrigin,
  changeOrigin: true,
  secure: true,
});
app.use("/api/course", apiProxy);
app.use("/api/student", apiProxy);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/institute", instituteRouter);
app.use("/api/rbac/access-control",accessControlRoutes);
app.use("/api/rbac/feature", featureManagementRoutes);
app.use("/api/rbac/permission", permissionRoutes);
app.use("/api/rbac/subscription", subscriptionRoutes);
app.use("/api/roles", roleRoutes);

app.get('/__vite_ping', (req, res) => {
  res.sendStatus(200); // respond OK to silence the 404
});
// Routes
app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});

app.use(errorMiddleware);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).send("404: Page not found");
});

module.exports = app;
