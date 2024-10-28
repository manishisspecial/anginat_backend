const express = require('express');
const OtpController = require('../controllers/OtpController');
const router = express.Router();
router.post('/generate', OtpController.generateOtp);
router.post('/verify', OtpController.verifyOtp);
module.exports = router;
