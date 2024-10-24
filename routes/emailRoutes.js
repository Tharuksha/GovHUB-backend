const express = require("express");
const router = express.Router();
const {
  sendAppointmentConfirmationEmail,
} = require("../services/emailService");

/**
 * @swagger
 * /api/email/appointment-confirmation:
 *   post:
 *     summary: Send appointment confirmation email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - appointmentDetails
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient's email address
 *               appointmentDetails:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     description: Appointment date
 *                   time:
 *                     type: string
 *                     description: Appointment time
 *                   department:
 *                     type: string
 *                     description: Department name
 *                   purpose:
 *                     type: string
 *                     description: Purpose of appointment
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       500:
 *         description: Error sending email
 */
router.post("/appointment-confirmation", async (req, res) => {
  try {
    const { to, appointmentDetails } = req.body;
    await sendAppointmentConfirmationEmail(to, appointmentDetails);
    res.status(200).json({ message: "Confirmation email sent successfully" });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    res.status(500).json({ error: "Failed to send confirmation email" });
  }
});

module.exports = router;
