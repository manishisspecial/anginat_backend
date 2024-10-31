const Otp = require('../models/Otp');
class OtpRepository {
    async createOtp(otpData) {
        const otp = new Otp(otpData);
        return await otp.save();
    }
    async findOtp(otp, receiverId,otpType) {
        return await Otp.findOne({otp,receiverId, otpType });
    }
}

module.exports = new OtpRepository();
