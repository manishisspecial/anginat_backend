const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    otp: { type: String, required: true },
    receiverId: { type: String, required: true },
    otpType: { type: String, enum: ['email', 'phone'], required: true },
    status: {type: String,enum: ['unused', 'used'], default: 'unused'},
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Otp', otpSchema);
