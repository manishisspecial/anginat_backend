const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return Promise.resolve();
  }

  const env = process.env.NODE_ENV === "production" ? "production" : "development";
  const config = require("./config")[env];

  if (!config?.mongodbUri) {
    console.error(`Failed to connect to MongoDB: missing uri for env "${env}"`);
    return Promise.resolve();
  }

  return mongoose
    .connect(config.mongodbUri, config.mongodbOptions)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => console.error("Failed to connect to MongoDB", error));
};
module.exports = connectDatabase;
