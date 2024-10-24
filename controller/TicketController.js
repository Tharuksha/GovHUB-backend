const { Ticket } = require("../model/TicketModel");
const { Customer } = require("../model/CustomerModel");
const { Department } = require("../model/DepartmentModel");
const { sendTicketStatusUpdateEmail } = require("../services/emailService");

class TicketController {
  // Add a new ticket
  async addTicket(req, res) {
    const ticket = new Ticket(req.body);
    try {
      const savedTicket = await ticket.save();

      // Fetch full ticket details with populated fields
      const fullTicket = await Ticket.findById(savedTicket._id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName");

      // Send email notification
      try {
        const customer = await Customer.findById(ticket.customerID);
        const department = await Department.findById(ticket.departmentID);

        if (customer?.emailAddress) {
          await sendTicketStatusUpdateEmail(customer.emailAddress, {
            ticketId: ticket._id,
            status: ticket.status,
            department: department?.departmentName || "Unknown Department",
            issueDescription: ticket.issueDescription,
            appointmentDate: ticket.appointmentDate,
          });
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Continue with ticket creation even if email fails
      }

      res.status(201).json({
        success: true,
        message: "Ticket created successfully",
        ticket: fullTicket,
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Get all tickets
  async getTickets(req, res) {
    try {
      const tickets = await Ticket.find()
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName")
        .sort({ createdDate: -1 }); // Sort by creation date, newest first

      res.status(200).json(tickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get single ticket by ID
  async getTicketById(req, res) {
    const { id } = req.params;
    try {
      const ticket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName");

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.status(200).json(ticket);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Update ticket
  async updateTicket(req, res) {
    const { id } = req.params;

    try {
      let ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Store old status for comparison
      const oldStatus = ticket.status;

      // Update ticket fields
      Object.assign(ticket, req.body);

      // Set closed date if status is changing to Approved or Rejected
      if (
        (req.body.status === "Approved" || req.body.status === "Rejected") &&
        oldStatus !== req.body.status
      ) {
        ticket.closedDate = new Date();
      }

      // Save the updated ticket
      await ticket.save();

      // Fetch updated ticket with populated fields
      const updatedTicket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName");

      // Send email notification if status changed
      if (req.body.status && oldStatus !== req.body.status) {
        try {
          const customer = await Customer.findById(ticket.customerID);
          const department = await Department.findById(ticket.departmentID);

          if (customer?.emailAddress) {
            await sendTicketStatusUpdateEmail(customer.emailAddress, {
              ticketId: ticket._id,
              status: ticket.status,
              department: department?.departmentName || "Unknown Department",
              issueDescription: ticket.issueDescription,
              feedback: ticket.feedback,
              rejectionReason: ticket.rejectionReason,
              appointmentDate: ticket.appointmentDate,
            });
          }
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
          // Continue with ticket update even if email fails
        }
      }

      res.status(200).json({
        success: true,
        message: "Ticket updated successfully",
        ticket: updatedTicket,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Delete ticket
  async deleteTicket(req, res) {
    const { id } = req.params;

    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.status(200).json({
        success: true,
        message: "Ticket deleted successfully",
        ticketId: id,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Reject ticket
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
      let ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Update ticket fields
      ticket.status = "Rejected";
      ticket.rejectionReason = rejectionReason;
      ticket.closedDate = new Date();
      if (staffID) ticket.staffID = staffID;

      await ticket.save();

      // Fetch updated ticket with populated fields
      const updatedTicket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName");

      // Send rejection email notification
      try {
        const customer = await Customer.findById(ticket.customerID);
        const department = await Department.findById(ticket.departmentID);

        if (customer?.emailAddress) {
          await sendTicketStatusUpdateEmail(customer.emailAddress, {
            ticketId: ticket._id,
            status: "Rejected",
            department: department?.departmentName || "Unknown Department",
            issueDescription: ticket.issueDescription,
            rejectionReason: rejectionReason,
          });
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Continue with ticket rejection even if email fails
      }

      res.status(200).json({
        success: true,
        message: "Ticket rejected successfully",
        ticket: updatedTicket,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get recent rejected tickets
  async getRecentRejectedTickets(req, res) {
    const { staffId } = req.params;
    try {
      const recentRejectedTickets = await Ticket.find({
        staffID: staffId,
        status: "Rejected",
      })
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName")
        .sort({ closedDate: -1 })
        .limit(5);

      res.status(200).json(recentRejectedTickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TicketController();
