const dotenv = require("dotenv");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const leadRoutes = require('./routes/leadRoutes');

dotenv.config();
const app = express();
// Middleware
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/lead', leadRoutes);


// Routes


// Error Handling
app.use(errorMiddleware);
app.get('/', (req, res) => {
    res.send('Server is Running! 🚀');
});

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).send('404: Page not found');
});

module.exports = app;
