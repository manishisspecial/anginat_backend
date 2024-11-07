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
const allowedOrigins = [
    'http://localhost:5173',
    'https://learning.anginat.com',
    'https://springlearns.com',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/lead', leadRoutes);

// Routes
app.get('/', (req, res) => {
    res.send('Server is Running! 🚀');
});


app.use(errorMiddleware);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).send('404: Page not found');
});

module.exports = app;
