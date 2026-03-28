const path = require("path");
const dotenv = require("dotenv");

// Load env from monorepo root (`env` or `.env`) then local `.env` (later wins).
[
  path.join(__dirname, "..", "env"),
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, ".env"),
].forEach((p) => dotenv.config({ path: p, override: true }));

const connectDatabase = require("./config/database");
const wsManager = require("./socket/websocketServer");

const PORT = process.env.PORT || 4000;

connectDatabase().then(() => {
  const app = require("./app");

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  wsManager.initialize(server);

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
    server.close(() => process.exit(1));
  });

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
    server.close(() => process.exit(1));
  });
});
  