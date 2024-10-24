// controllers/TicketController.js

const { Ticket } = require("../model/TicketModel");

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
   *             staffID: "60c72b2f9b1e8c001f5f7c6f"
   *             departmentID: "60c72b2f9b1e8c001f5f7c70"
   *             issueDescription: "Cannot log into the system with valid credentials."
   *             status: "Pending"
   *             appointmentDate: "2024-10-01T09:00:00Z"
   *     responses:
   *       201:
   *         description: Ticket created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Error creating ticket
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async addTicket(req, res) {
    const ticket = new Ticket(req.body);
    try {
      await ticket.save();
      res
        .status(201)
        .json({ success: true, message: "Ticket created successfully" });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * @swagger
   * /api/tickets:
   *   get:
   *     summary: Retrieve a list of all tickets
   *     tags: [Tickets]
   *     responses:
   *       200:
   *         description: A list of tickets
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ticket'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The ticket ID
   *     responses:
   *       200:
   *         description: Ticket details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Ticket'
   *       404:
   *         description: Ticket not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The ticket ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TicketUpdateInput'
   *           example:
   *             status: "Solved"
   *             feedback: "Issue resolved by updating user permissions"
   *     responses:
   *       200:
   *         description: Ticket updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       404:
   *         description: Ticket not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   * /api/tickets/{id}/reject:
   *   put:
   *     summary: Reject a ticket
   *     tags: [Tickets]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The ticket ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - rejectionReason
   *             properties:
   *               rejectionReason:
   *                 type: string
   *               staffID:
   *                 type: string
   *           example:
   *             rejectionReason: "Issue cannot be reproduced"
   *             staffID: "60c72b2f9b1e8c001f5f7c6f"
   *     responses:
   *       200:
   *         description: Ticket rejected successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       404:
   *         description: Ticket not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   * /api/tickets/{id}:
   *   delete:
   *     summary: Delete a ticket by ID
   *     tags: [Tickets]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The ticket ID
   *     responses:
   *       200:
   *         description: Ticket deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       404:
   *         description: Ticket not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   * /api/tickets/recentRejected/{staffId}:
   *   get:
   *     summary: Retrieve recent rejected tickets for a staff member
   *     tags: [Tickets]
   *     parameters:
   *       - in: path
   *         name: staffId
   *         schema:
   *           type: string
   *         required: true
   *         description: The staff ID
   *     responses:
   *       200:
   *         description: A list of recent rejected tickets
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ticket'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
