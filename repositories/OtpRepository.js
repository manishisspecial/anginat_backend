const Otp = require('../models/Otp');
class OtpRepository {
    async createOtp(otpData) {
        const otp = new Otp(otpData);
        return await otp.save();
    }
    async findOtp(userId, otp, otpType) {
        return await Otp.findOne({ userId, otp, otpType });
    }
}

module.exports = new OtpRepository();
