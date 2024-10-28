const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    development: {
        mongodbUri:process.env.MONGO_URI,
        mongodbOptions: { useNewUrlParser: true, useUnifiedTopology: true }
    },
    production: {
        mongodbUri: process.env.MONGODB_URI_PROD,
        mongodbOptions: { useNewUrlParser: true, useUnifiedTopology: true }
    }
};
