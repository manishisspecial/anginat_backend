const app = require("./app");
const connectDatabase = require("./config/database");
const wsManager = require("./socket/websocketServer");
const PORT = process.env.PORT || 4000;
connectDatabase();

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

wsManager.initialize(server);

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
  