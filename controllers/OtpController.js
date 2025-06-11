const jwt = require('jsonwebtoken');
const OtpService = require('../services/OtpService');
const UserService = require('../services/UserService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');


class OtpController {
    async generateOtp(req, res) {
        try {
            const { receiverId, otpType } = req.body;
            const otpCode = await OtpService.generateOtp(otpType, receiverId);
            //await OtpService.sendOtpSms(receiverId, otpCode);
            if (otpType === "email") {
                await OtpService.sendOtpEmail(receiverId, otpCode);
            } else if (otpType === "phone") {
                console.log(receiverId, otpCode);
                await OtpService.sendOtpSms(receiverId, otpCode); // Send SMS if otpType is sms
            } else {
                return sendErrorResponse(res, 'Invalid otpType', 400);
            }
            return sendSuccessResponse(res, 'OTP generated and sent successfully.');
        } catch (error) {
            return sendErrorResponse(res, 'Error generating OTP', 500, error.message || error);
        }
    }

    async verifyOtp(req, res) {
        try {
            const { otp, receiverId, otpType } = req.body;
            const isValid = await OtpService.verifyOtp(otp, receiverId, otpType);
            if (!isValid) {
                return sendErrorResponse(res, 'Invalid or expired OTP', 400);
            }
            const verifiedToken = jwt.sign(
                { email: receiverId },
                process.env.VERIFY_OTP_SECRET,
                { expiresIn: "10m" }
            );

            res.cookie("verifiedToken", verifiedToken, {
                httpOnly: true,
                secure: true, // Use secure cookies in production
                sameSite: "None", // Required for cross-origin cookies
                maxAge: 10 * 60 * 1000, // 10 minutes
                path: "/",
            });

            return sendSuccessResponse(res, 'OTP verified successfully.');
        } catch (error) {
            return sendErrorResponse(res, 'Error verifying OTP', 500, error.message || error);
        }
    }
}
module.exports = new OtpController();

