const OtpRepository = require("../repositories/OtpRepository");
const nodemailer = require("nodemailer");
const unirest = require("unirest");
const sgMail = require("@sendgrid/mail");
const axios = require("axios")
class OtpService {
    
  async generateOtp(otpType, receiverId) {
    const otpCode = this._generateOtpCode();
    const otp = await OtpRepository.createOtp({
      receiverId,
      otp: otpCode,
      otpType,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });
    return otpCode;
  }

  async verifyOtp(otp, receiverId, otpType) {
    console.log(otp, receiverId, otpType);
    const storedOtp = await OtpRepository.findOtp(otp, receiverId, otpType);
    if (
      !storedOtp ||
      storedOtp.expiresAt < new Date() ||
      storedOtp.status === "used"
    ) {
      return false;
    }
    storedOtp.status = "used";
    await storedOtp.save();
    return true;
  }

  async sendOtpEmail(email, otpCode) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    if (!email || !otpCode) {
      throw new Error("Email and OTP code are required to send the email.");
    }
    const msg = {
      to: email,
      from: process.env.OTP_EMAIL,
      subject: "Anginat Institution Code",
      text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`,
      html: `<strong>Your OTP code is ${otpCode}. It will expire in 10 minutes.</strong>`,
    };
    try {
      await sgMail.send(msg);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /*async sendOtpEmail(email, otpCode) {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`
        };

        return await transporter.sendMail(mailOptions);
    }*/

  async sendOtpSms(phoneNumber, otpCode) {
    if (!phoneNumber || !otpCode) {
      throw new Error("Phone number and OTP code are required to send SMS.");
    }

    try {
      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "otp",
          variables_values: otpCode,
          flash: "1",
          numbers: phoneNumber,
        },
        {
          headers: {
            authorization: process.env.SMS_API,
            "Content-Type": "application/json", // Ensure JSON data is properly sent
          },
        }
      );

      console.log("SMS sent successfully:", response.data);
      return response.data; // Return the API response for further use
    } catch (error) {
      console.error(
        "Error sending OTP:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data || "Failed to send OTP");
    }
  }
  _generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates 6-digit OTP
  }
}
module.exports = new OtpService();
