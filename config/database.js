const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  const env = process.env.NODE_ENV === "production" ? "production" : "development";
  const config = require("./config")[env];

  if (!config?.mongodbUri) {
    const err = new Error(`Failed to connect to MongoDB: missing uri for env "${env}"`);
    console.error(err.message);
    return Promise.reject(err);
  }

  return mongoose
    .connect(config.mongodbUri, config.mongodbOptions)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => console.error("Failed to connect to MongoDB", error));
};
module.exports = connectDatabase;
