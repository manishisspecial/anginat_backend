const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmail = async ({ recipientEmail, subject, textContent, html }) => {
  try {
    const msg = {
      to: recipientEmail,
      from: process.env.OTP_EMAIL,
      subject: subject,
      text: textContent,
      html: html,
    };
    
    await sgMail.send(msg);
  } catch (error) {
  }
};

module.exports = { sendEmail };