// TicketController.js
const { Ticket } = require("../model/TicketModel");
const { Customer } = require("../model/CustomerModel");
const { Department } = require("../model/DepartmentModel");
const {
  sendTicketStatusUpdateEmail,
  sendAppointmentConfirmationEmail,
} = require("../services/emailService");

class TicketController {
  /**
   * @swagger
   * /api/tickets:
   *   post:
   *     summary: Add a new ticket and send email notification
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
   */
  async addTicket(req, res) {
    const ticket = new Ticket(req.body);
    try {
      await ticket.save();

      // Fetch customer and department details
      const [customer, department] = await Promise.all([
        Customer.findById(req.body.customerID),
        Department.findById(req.body.departmentID),
      ]);

      if (customer?.emailAddress) {
        const ticketDetails = {
          ticketId: ticket._id,
          status: "Pending",
          department: department?.departmentName || "Unknown Department",
          issueDescription: ticket.issueDescription,
          appointmentDate: ticket.appointmentDate,
        };

        await sendTicketStatusUpdateEmail(customer.emailAddress, ticketDetails);
      }

      res.status(201).json({
        success: true,
        message: "Ticket created successfully",
        ticketId: ticket._id,
        emailSent: customer?.emailAddress ? true : false,
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getTickets(req, res) {
    try {
      const tickets = await Ticket.find()
        .populate("customerID", "firstName lastName emailAddress")
        .populate("staffID", "firstName lastName")
        .populate("departmentID", "departmentName");
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTicketById(req, res) {
    const { id } = req.params;
    try {
      const ticket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("staffID", "firstName lastName")
        .populate("departmentID", "departmentName");

      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      res.json(ticket);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateTicket(req, res) {
    const { id } = req.params;

    try {
      let ticket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName");

      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      const previousStatus = ticket.status;
      Object.assign(ticket, req.body);

      if (req.body.status === "Approved" || req.body.status === "Rejected") {
        ticket.closedDate = new Date();
      }

      await ticket.save();

      // Handle email notifications
      let emailSent = false;
      if (previousStatus !== ticket.status && ticket.customerID?.emailAddress) {
        const ticketDetails = {
          ticketId: ticket._id,
          status: ticket.status,
          department:
            ticket.departmentID?.departmentName || "Unknown Department",
          issueDescription: ticket.issueDescription,
          appointmentDate: ticket.appointmentDate,
          feedback: ticket.feedback,
          rejectionReason: ticket.rejectionReason,
        };

        await sendTicketStatusUpdateEmail(
          ticket.customerID.emailAddress,
          ticketDetails
        );

        // Send appointment confirmation if approved with appointment
        if (ticket.status === "Approved" && ticket.appointmentDate) {
          await sendAppointmentConfirmationEmail(
            ticket.customerID.emailAddress,
            {
              id: ticket._id,
              date: new Date(ticket.appointmentDate).toLocaleDateString(),
              time: new Date(ticket.appointmentDate).toLocaleTimeString(),
              department:
                ticket.departmentID?.departmentName || "Unknown Department",
              purpose: ticket.issueDescription,
            }
          );
        }

        emailSent = true;
      }

      res.json({
        success: true,
        message: "Ticket updated successfully",
        emailSent,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async rejectTicket(req, res) {
    const { id } = req.params;
    const { rejectionReason, staffID } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    try {
      let ticket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName");

      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      ticket.status = "Rejected";
      ticket.rejectionReason = rejectionReason;
      ticket.closedDate = new Date();
      if (staffID) ticket.staffID = staffID;

      await ticket.save();

      let emailSent = false;
      if (ticket.customerID?.emailAddress) {
        await sendTicketStatusUpdateEmail(ticket.customerID.emailAddress, {
          ticketId: ticket._id,
          status: "Rejected",
          department:
            ticket.departmentID?.departmentName || "Unknown Department",
          issueDescription: ticket.issueDescription,
          rejectionReason: rejectionReason,
        });
        emailSent = true;
      }

      res.json({
        success: true,
        message: "Ticket rejected successfully",
        emailSent,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

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

  async getRecentRejectedTickets(req, res) {
    const { staffId } = req.params;
    try {
      const recentRejectedTickets = await Ticket.find({
        staffID: staffId,
        status: "Rejected",
      })
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .sort({ closedDate: -1 })
        .limit(5);

      res.json(recentRejectedTickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TicketController();
