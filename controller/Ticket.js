const { Ticket } = require("../model/Ticket");
const {
  sendAppointmentConfirmationEmail,
} = require("../services/emailService");

class TicketController {
  /**
   * @swagger
   * /api/tickets:
   *   post:
   *     summary: Add a new ticket
   *     tags: [Tickets]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TicketInput'
   *           example:
   *             customerID: "60c72b2f9b1e8c001f5f7c6e"
   *             customerEmail: "customer@example.com"
   *             departmentName: "Department Name"
   *             appointmentDate: "2024-10-01"
   *             appointmentTime: "09:00:00"
   *             issueDescription: "Issue description"
   *     responses:
   *       201:
   *         description: Ticket created successfully
   *       400:
   *         description: Error creating ticket
   */
  async addTicket(req, res) {
    try {
      const {
        customerEmail,
        departmentName,
        appointmentDate,
        appointmentTime,
        issueDescription,
        ...ticketData
      } = req.body;

      const ticket = new Ticket({
        ...ticketData,
        appointmentDate,
        appointmentTime,
      });

      await ticket.save();

      // Send confirmation email
      await sendAppointmentConfirmationEmail(customerEmail, {
        date: appointmentDate,
        time: appointmentTime,
        department: departmentName,
        purpose: issueDescription,
      });

      res.status(201).json({
        message: "Ticket created successfully",
        ticket,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(400).json({
        message: "Error creating ticket",
        error: error.message,
      });
    }
  }

  /**
   * @swagger
   * /api/tickets:
   *   get:
   *     summary: Retrieve a list of all tickets
   *     tags: [Tickets]
   */
  async getTickets(req, res) {
    try {
      const tickets = await Ticket.find();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/tickets/{id}:
   *   get:
   *     summary: Retrieve a single ticket by ID
   *     tags: [Tickets]
   */
  async getTicketById(req, res) {
    const { id } = req.params;
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      res.json(ticket);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/tickets/{id}:
   *   put:
   *     summary: Update an existing ticket
   *     tags: [Tickets]
   */
  async updateTicket(req, res) {
    const { id } = req.params;

    try {
      let ticket = await Ticket.findById(id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      Object.assign(ticket, req.body);

      if (req.body.status === "Approved" || req.body.status === "Rejected") {
        ticket.closedDate = new Date();
      }

      await ticket.save();
      res.json({ success: true, message: "Ticket updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/tickets/{id}:
   *   delete:
   *     summary: Delete a ticket by ID
   *     tags: [Tickets]
   */
  async deleteTicket(req, res) {
    const { id } = req.params;

    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      res.json({ success: true, message: "Ticket deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/tickets/{id}/reject:
   *   put:
   *     summary: Reject a ticket
   *     tags: [Tickets]
   */
  async rejectTicket(req, res) {
    const { id } = req.params;
    const { rejectionReason, staffID } = req.body;

    if (!rejectionReason) {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }

    try {
      let ticket = await Ticket.findById(id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      ticket.status = "Rejected";
      ticket.rejectionReason = rejectionReason;
      ticket.closedDate = new Date();
      if (staffID) ticket.staffID = staffID;

      await ticket.save();
      res.json({ success: true, message: "Ticket rejected successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/tickets/recentRejected/{staffId}:
   *   get:
   *     summary: Retrieve recent rejected tickets for a staff member
   *     tags: [Tickets]
   */
  async getRecentRejectedTickets(req, res) {
    const { staffId } = req.params;
    try {
      const recentRejectedTickets = await Ticket.find({
        staffID: staffId,
        status: "Rejected",
      })
        .sort({ closedDate: -1 })
        .limit(5);
      res.json(recentRejectedTickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TicketController();
