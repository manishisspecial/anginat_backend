const Otp = require('../models/Otp');

class OtpRepository {
    async createOtp(otpData) {
        const otp = new Otp(otpData);
        return await otp.save();
    }

    async findOtp(otp, receiverId, otpType) {
        return await Otp.findOne({
            otp,
            receiverId,
            otpType,
            status: 'unused',
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
    }

    async invalidateOtps(receiverId, otpType) {
        await Otp.updateMany(
            { receiverId, otpType, status: 'unused' },
            { status: 'used' }
        );
    }
}

module.exports = new OtpRepository();
