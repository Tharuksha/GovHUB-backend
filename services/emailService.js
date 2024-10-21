const nodemailer = require("nodemailer");

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a generic email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient's name
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = "Welcome to Gov Hub";
  const html = `
    <h1>Welcome to Gov Hub, ${name}!</h1>
    <p>Thank you for creating an account with us. We're excited to have you on board.</p>
    <p>You can now log in and start scheduling your appointments.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Best regards,</p>
    <p>The Gov Hub Team</p>
  `;

  try {
    await sendEmail({ to, subject, html });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // You might want to handle this error based on your application's needs
    // For example, you could log it to a monitoring service or retry sending the email
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  const subject = "Gov Hub Password Reset";
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Gov Hub Password Reset</h1>
    <p>You have requested to reset your password. Please click the link below to set a new password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,</p>
    <p>The Gov Hub Team</p>
  `;

  try {
    await sendEmail({ to, subject, html });
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // Handle error as needed
  }
};

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
