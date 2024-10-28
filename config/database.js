const mongoose = require('mongoose');
const env=process.env.NODE_ENV;
const config = require('./config')[env];
mongoose.set('strictQuery', true);
const connectDatabase = () => {
    mongoose.connect(config.mongodbUri, config.mongodbOptions)
        .then(() => console.log('Connected to MongoDB'))
        .catch(error => console.error('Failed to connect to MongoDB', error));
}
module.exports = connectDatabase;
