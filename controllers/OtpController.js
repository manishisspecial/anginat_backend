const OtpService = require('../services/OtpService');
const UserService = require('../services/UserService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

class OtpController {
    async generateOtp(req, res) {
        try {
            const { userId, email, otpType } = req.body;
            const user = await UserService.findById(userId);
            if (!user) return sendErrorResponse(res, 'User not found', 404);
            const otpCode = await OtpService.generateOtp(userId, otpType);
            await OtpService.sendOtpEmail(email, otpCode);
            return sendSuccessResponse(res, 'OTP generated and sent successfully.');
        } catch (error) {
            return sendErrorResponse(res, 'Error generating OTP', 500, error.message || error);
        }
    }
    async verifyOtp(req, res) {
        try {
            const { userId, otp, otpType } = req.body;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid MongoDB ID');
            }
            const isValid = await OtpService.verifyOtp(userId, otp, otpType);
            if (!isValid) {
                return sendErrorResponse(res, 'Invalid or expired OTP', 400);
            }
            return sendSuccessResponse(res, 'OTP verified successfully.');
        } catch (error) {
            return sendErrorResponse(res, 'Error verifying OTP', 500, error.message || error);
        }
    }
}
module.exports = new OtpController();
