const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    development: {
        mongodbUri: process.env.MONGO_URI,
        mongodbOptions: {},
    },
    production: {
        mongodbUri: process.env.MONGO_URI,
        mongodbOptions: {},
    },
};
