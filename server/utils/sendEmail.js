require("dotenv").config();
const sgMail = require("@sendgrid/mail");

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.name - Sender name (optional)
 * @param {string} options.replyTo - Reply-to email (optional)
 */
const sendEmail = async (options) => {
  try {
    if (!options.html || options.html.trim().length === 0) {
      throw new Error("HTML email content is missing");
    }

    const msg = {
      to: options.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: options.name || process.env.EMAIL_FROM_NAME,
      },
      subject: options.subject,
      html: options.html,
      text:
        options.text ||
        "Please view this email in an HTML-compatible email client.",
    };

    if (options.replyTo) {
      msg.replyTo = options.replyTo;
    }

    const response = await sgMail.send(msg);

    console.log("✅ Email sent successfully");
    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
    };
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error.message);
    throw error;
  }
};

module.exports = sendEmail;
