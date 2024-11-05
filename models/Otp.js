const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const otpSchema = new Schema({
    otp: {
        type: String,
        required: [true, 'OTP is required'],
        minlength: [6, 'OTP must be at least 6 characters long'],
        maxlength: [6, 'OTP must be exactly 6 characters long'],
        match: [/^\d{6}$/, 'OTP must be a 6-digit number'],
    },
    receiverId: {
        type: String,
        required: [true, 'Receiver ID is required'],
        minlength: [6, 'Receiver ID must be at least 6 characters long'],
    },
    otpType: {
        type: String,
        enum: {
            values: ['email', 'phone'],
            message: 'OTP type must be either "email" or "phone"',
        },
        required: [true, 'OTP type is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['unused', 'used'],
            message: 'Status must be either "unused" or "used"',
        },
        default: 'unused',
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required'],
        validate: {
            validator: function(value) {
                return value > Date.now();
            },
            message: 'Expiration date must be in the future',
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model('Otp', otpSchema);
