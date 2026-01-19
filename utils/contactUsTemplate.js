const contactUsTemplate = ({name, email, phoneNumber, message, inquiryType, company}) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; font-size: 24px; font-weight: bold; color: #333;">New Contact Us Form Submission</div>
        <div style="margin-top: 20px; font-size: 16px; color: #555;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email Address:</strong> ${email}</p>
            ${phoneNumber ? `<p><strong>Phone Number:</strong> ${phoneNumber}</p>` : ''}
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
            <p><strong>Message:</strong> ${message}</p>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 14px; color: #777;">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
    </div>
    `;
};

module.exports = contactUsTemplate;
