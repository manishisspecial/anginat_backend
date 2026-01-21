const axios = require('axios');

class EmailService {

    static async sendEmail({ from,to, subject, body, attachment = null }) {
        const params = {
            sender: {
                name: "AnginatEvents Website",
                email: "noreply@anginat.com" // Your verified domain email
            },
            replyTo: {
                email: from, // User's email goes here
            },
            to: [{
                email: to, // Your team's email
                name: "Contact Team"
            }],
            subject: subject,
            htmlContent: body
        };

        if (attachment) {
            params.attachment = [attachment];
        }


        try {
            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                params,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'api-key': process.env.BREVO_API_KEY
                    }
                }
            );

            // Return similar format to AWS SES
            const result = {
                MessageId: response.data.messageId,
                ResponseMetadata: {
                    RequestId: response.data.messageId
                }
            };

            return result;

        } catch (error) {
            console.error('Brevo email sending error:', error.response?.data || error.message);

            if (error.response) {
                throw new Error(`Brevo API Error: ${error.response.data.message || error.response.statusText}`);
            }

            throw new Error(`Email sending failed: ${error.message}`);
        }
    }
}

module.exports = EmailService;