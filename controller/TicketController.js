// controllers/TicketController.js

const { Ticket } = require("../model/TicketModel");
const mongoose = require("mongoose");

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

  async getTicketsByDepartment(req, res) {
    try {
      const { departmentId } = req.params;

      // Validate department ID
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID format",
        });
      }

      // Check if department exists
      const departmentExists = await Department.findById(departmentId);
      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      // Get current date at midnight
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Find tickets for the department
      const tickets = await Ticket.find({
        departmentID: departmentId,
        appointmentDate: { $gte: startOfDay },
      })
        .populate([
          {
            path: "customerID",
            select: "firstName lastName emailAddress phoneNumber -_id",
          },
          {
            path: "departmentID",
            select: "departmentName operatingHours -_id",
          },
        ])
        .sort({ appointmentDateTime: 1 });

      // Format response
      const formattedTickets = tickets.map((ticket) => ({
        id: ticket._id,
        customer: ticket.customerID,
        department: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        notes: ticket.notes,
        appointmentDate: ticket.appointmentDate,
        appointmentTime: ticket.appointmentTime,
        status: ticket.status,
        createdAt: ticket.createdAt,
      }));

      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: formattedTickets,
      });
    } catch (error) {
      console.error("Error in getTicketsByDepartment:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving tickets",
        error: error.message,
      });
    }
  }

  // Get ticket slots availability
  async getTicketAvailability(req, res) {
    try {
      const { departmentId, date } = req.params;

      // Validate department ID
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID format",
        });
      }

      // Validate date format
      const selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }

      // Get department operating hours
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      // Set start and end of selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get existing appointments for the date
      const existingAppointments = await Ticket.find({
        departmentID: departmentId,
        appointmentDateTime: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).select("appointmentDateTime");

      // Generate all possible 30-minute slots within operating hours
      const slots = [];
      const startHour = 8; // Assuming start time is 8 AM
      const endHour = startHour + (department.operatingHours || 8);

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of [0, 30]) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);

          // Skip lunch hour (12-1 PM)
          if (hour === 12) continue;

          const isBooked = existingAppointments.some((appointment) => {
            return (
              appointment.appointmentDateTime.getTime() === slotTime.getTime()
            );
          });

          slots.push({
            time: slotTime.toISOString(),
            isAvailable: !isBooked,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          departmentName: department.departmentName,
          operatingHours: {
            start: `${startHour}:00`,
            end: `${endHour}:00`,
          },
          slots,
        },
      });
    } catch (error) {
      console.error("Error in getTicketAvailability:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking availability",
        error: error.message,
      });
    }
  }

  // Helper method to validate ticket data
  validateTicketData(data) {
    const errors = [];

    if (!data.customerID) errors.push("Customer ID is required");
    if (!data.departmentID) errors.push("Department ID is required");
    if (!data.issueDescription) errors.push("Issue description is required");
    if (!data.notes) errors.push("Notes are required");
    if (!data.appointmentDate) errors.push("Appointment date is required");
    if (!data.appointmentTime) errors.push("Appointment time is required");

    return errors;
  }

  // Helper method to check if slot is available
  async isSlotAvailable(departmentId, appointmentDateTime) {
    const existingAppointment = await Ticket.findOne({
      departmentID: departmentId,
      appointmentDateTime,
    });

    return !existingAppointment;
  }
}

module.exports = new TicketController();
