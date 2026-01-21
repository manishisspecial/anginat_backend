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
dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:5172",
  "http://localhost:5173",
  "https://www.anginatlearning.com",
  "https://anginatevents.com",
  "https://main.d2p986kto1ef06.amplifyapp.com",
  "https://admin.anginatlearning.com",
  "https://www.springlearns.com",
  "https://testing.d2uojw7xfu916c.amplifyapp.com",
  "https://ravneet.de9ljefa2nzpw.amplifyapp.com", 
  "https://main.d336rzhcy31fea.amplifyapp.com"
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
