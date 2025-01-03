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
    from: `"Gov Hub" <${process.env.EMAIL_USER}>`,
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
 * Generate the base HTML template for emails
 * @param {string} content - The main content of the email
 * @param {string} recipientEmail - The recipient's email address
 * @returns {string} - The complete HTML template
 */
const generateEmailTemplate = (content, recipientEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gov Hub</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px; overflow: hidden;">
        <tr>
          <td style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <img src="https://i.ibb.co/vBkZkcV/logo.png" alt="Gov Hub Logo" style="max-width: 150px;">
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 30px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  ${content}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Gov Hub. All rights reserved.</p>
            <p>This email was sent to ${recipientEmail}. If you didn't interact with Gov Hub, please ignore this email.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient's name
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (to, name) => {
  const subject =
    "Welcome to Gov Hub - Your Gateway to Efficient Government Services";
  const content = `
    <h1 style="color: #4a90e2; margin-bottom: 20px;">Welcome to Gov Hub, ${name}!</h1>
    <p style="margin-bottom: 15px;">We're thrilled to have you on board. Gov Hub is your one-stop solution for efficient government services and appointment scheduling.</p>
    <p style="margin-bottom: 15px;">Here's what you can do with your new account:</p>
    <ul style="padding-left: 20px; margin-bottom: 20px;">
      <li>Schedule appointments with various government departments</li>
      <li>Track the status of your applications and requests</li>
      <li>Receive timely notifications about your interactions</li>
      <li>Access important government resources and information</li>
    </ul>
    <p style="margin-bottom: 20px;">To get started, simply log in to your account and explore the dashboard.</p>
    <a href="https://user.tharuksha.com/login" style="display: inline-block; padding: 12px 20px; background-color: #4a90e2; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In to Gov Hub</a>
    <p style="margin-top: 30px;">If you have any questions or need assistance, our support team is always here to help. Feel free to reach out to us at support@govhub.com</p>
    <p style="margin-bottom: 0;">Best regards,<br>The Gov Hub Team</p>
  `;

  const html = generateEmailTemplate(content, to);

  try {
    await sendEmail({ to, subject, html });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

/**
 * Send ticket status update email to customer
 * @param {string} to - Customer's email address
 * @param {Object} ticketDetails - Details of the ticket
 * @param {string} ticketDetails.ticketId - Ticket ID
 * @param {string} ticketDetails.status - New status of the ticket
 * @param {string} ticketDetails.department - Department name
 * @param {string} ticketDetails.issueDescription - Description of the issue
 * @param {string} [ticketDetails.feedback] - Feedback from staff (for resolved tickets)
 * @param {string} [ticketDetails.rejectionReason] - Reason for rejection (for rejected tickets)
 * @param {Date} [ticketDetails.appointmentDate] - Appointment date (if applicable)
 * @returns {Promise<void>}
 */
const sendTicketStatusUpdateEmail = async (to, ticketDetails) => {
  const statusColors = {
    Pending: "#f0ad4e", // Orange
    Approved: "#5cb85c", // Green
    Rejected: "#d9534f", // Red
  };

  const statusMessages = {
    Pending: "Your ticket is currently under review.",
    Approved: "Your ticket has been approved.",
    Rejected: "Your ticket has been rejected.",
  };

  // Generate status-specific content
  let statusSpecificContent = "";
  if (ticketDetails.status === "Approved") {
    statusSpecificContent = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
        <h3 style="color: #5cb85c; margin-bottom: 15px;">Next Steps</h3>
        ${
          ticketDetails.appointmentDate
            ? `<p style="margin-bottom: 10px;">Your appointment is scheduled for: <strong>${new Date(
                ticketDetails.appointmentDate
              ).toLocaleString()}</strong></p>`
            : ""
        }
        ${
          ticketDetails.feedback
            ? `<p style="margin-bottom: 10px;"><strong>Staff Feedback:</strong> ${ticketDetails.feedback}</p>`
            : ""
        }
        <p>Please make sure to bring any necessary documentation to your appointment.</p>
      </div>
    `;
  } else if (ticketDetails.status === "Rejected") {
    statusSpecificContent = `
      <div style="margin-top: 20px; padding: 15px; background-color: #fff7f7; border-radius: 5px;">
        <h3 style="color: #d9534f; margin-bottom: 15px;">Rejection Details</h3>
        ${
          ticketDetails.rejectionReason
            ? `<p style="margin-bottom: 10px;"><strong>Reason for Rejection:</strong> ${ticketDetails.rejectionReason}</p>`
            : ""
        }
        <p>If you believe this was done in error or need to submit additional information, 
           please create a new ticket with reference to this ticket ID.</p>
      </div>
    `;
  }

  const subject = `Gov Hub - Ticket Status Update [${ticketDetails.ticketId}]`;
  const content = `
    <h1 style="color: #4a90e2; margin-bottom: 20px;">Ticket Status Update</h1>
    <div style="margin-bottom: 30px;">
      <p style="margin-bottom: 15px;">Your ticket status has been updated.</p>
      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Ticket Details</h2>
        <p><strong>Ticket ID:</strong> ${ticketDetails.ticketId}</p>
        <p><strong>Department:</strong> ${ticketDetails.department}</p>
        <p><strong>Issue Description:</strong> ${
          ticketDetails.issueDescription
        }</p>
        <p><strong>Current Status:</strong> 
          <span style="color: ${
            statusColors[ticketDetails.status]
          }; font-weight: bold;">
            ${ticketDetails.status}
          </span>
        </p>
      </div>
      <p style="font-size: 16px; color: ${
        statusColors[ticketDetails.status]
      }; margin-bottom: 20px;">
        ${statusMessages[ticketDetails.status]}
      </p>
      ${statusSpecificContent}
    </div>
    <a href="https://user.tharuksha.com/tickets/${ticketDetails.ticketId}" 
       style="display: inline-block; padding: 12px 20px; background-color: #4a90e2; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
      View Ticket Details
    </a>
    <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact our support team.</p>
  `;

  const html = generateEmailTemplate(content, to);

  try {
    await sendEmail({ to, subject, html });
    console.log(`Ticket status update email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending ticket status update email:", error);
    throw new Error("Failed to send ticket status update email");
  }
};

/**
 * Send an appointment confirmation email
 * @param {string} to - Recipient email address
 * @param {Object} appointmentDetails - Details of the appointment
 * @returns {Promise<void>}
 */
const sendAppointmentConfirmationEmail = async (to, appointmentDetails) => {
  const subject = "Gov Hub - Appointment Confirmation";
  const content = `
    <h1 style="color: #4a90e2; margin-bottom: 20px;">Appointment Confirmation</h1>
    <p style="margin-bottom: 15px;">Your appointment has been successfully scheduled with Gov Hub.</p>
    <h2 style="color: #4a90e2; margin-top: 20px;">Appointment Details:</h2>
    <ul style="padding-left: 20px; margin-bottom: 20px;">
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.time}</li>
      <li><strong>Department:</strong> ${appointmentDetails.department}</li>
      <li><strong>Purpose:</strong> ${appointmentDetails.purpose}</li>
    </ul>
    <p style="margin-bottom: 20px;">Please arrive 10 minutes before your scheduled time. Don't forget to bring any necessary documents.</p>
    <a href="https://user.tharuksha.com/appointments/${appointmentDetails.id}" 
       style="display: inline-block; padding: 12px 20px; background-color: #4a90e2; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
      View Appointment Details
    </a>
    <p style="margin-top: 30px;">If you need to reschedule or cancel your appointment, please do so at least 24 hours in advance.</p>
    <p style="margin-bottom: 0;">Thank you for using Gov Hub!</p>
  `;

  const html = generateEmailTemplate(content, to);

  try {
    await sendEmail({ to, subject, html });
    console.log("Appointment confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
    throw new Error("Failed to send appointment confirmation email");
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmationEmail,
  sendTicketStatusUpdateEmail,
};
