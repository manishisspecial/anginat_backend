const OtpRepository = require('../repositories/OtpRepository');
const nodemailer = require('nodemailer');

class OtpService {
    async generateOtp(otpType,receiverId) {
        const otpCode = this._generateOtpCode();
        const otp = await OtpRepository.createOtp({
            receiverId,
            otp: otpCode,
            otpType,
            expiresAt: new Date(Date.now() + 10 * 60000) // 10 minutes expiry
        });
        return otpCode;
    }

    async verifyOtp(otp, receiverId,otpType) {
        const storedOtp = await OtpRepository.findOtp(otp,receiverId, otpType);
        console.log(storedOtp)
        if (!storedOtp ||
            storedOtp.expiresAt < new Date() ||
            storedOtp.status === 'used') {
            return false;
        }
        storedOtp.status = 'used';
        await storedOtp.save();
        return true;
    }

    async sendOtpEmail(email, otpCode) {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_ID, // Add your email user
                pass: process.env.MAIL_PASSWORD  // Add your email password
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`
        };

        return await transporter.sendMail(mailOptions);
    }

    _generateOtpCode() {
        return Math.floor(100000 + Math.random() * 900000).toString(); // Generates 6-digit OTP
    }
}
module.exports = new OtpService();
