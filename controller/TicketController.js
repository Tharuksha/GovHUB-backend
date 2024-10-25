const { Ticket } = require("../model/TicketModel");
const moment = require("moment");

class TicketController {
  async checkAvailability(req, res) {
    try {
      const { departmentID, appointmentDate, appointmentTime } = req.query;

      // Validate required parameters
      if (!departmentID || !appointmentDate || !appointmentTime) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters",
        });
      }

      // Create appointment datetime
      const appointmentDateTime = moment(
        `${appointmentDate} ${appointmentTime}`
      );

      if (!appointmentDateTime.isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid date or time format",
        });
      }

      // Check if date is in the past
      if (appointmentDateTime.isBefore(moment(), "minute")) {
        return res.json({
          isAvailable: false,
          message: "Cannot book appointments in the past",
        });
      }

      // Check if it's a weekend
      if (appointmentDateTime.day() === 0 || appointmentDateTime.day() === 6) {
        return res.json({
          isAvailable: false,
          message: "Appointments are not available on weekends",
        });
      }

      // Find existing appointments in the same hour
      const startTime = appointmentDateTime.clone().startOf("hour");
      const endTime = appointmentDateTime.clone().endOf("hour");

      const existingAppointment = await Ticket.findOne({
        departmentID,
        appointmentDateTime: {
          $gte: startTime.toDate(),
          $lte: endTime.toDate(),
        },
        status: { $nin: ["Rejected", "Cancelled"] },
      });

      res.json({
        isAvailable: !existingAppointment,
        message: existingAppointment
          ? "This time slot is already booked"
          : "Time slot is available",
        existingSlot: existingAppointment
          ? {
              time: existingAppointment.appointmentTime,
              date: moment(existingAppointment.appointmentDateTime).format(
                "YYYY-MM-DD"
              ),
            }
          : null,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({
        success: false,
        message: "Error checking appointment availability",
        error: error.message,
      });
    }
  }

  async addTicket(req, res) {
    try {
      const {
        departmentID,
        appointmentDate,
        appointmentTime,
        customerID,
        issueDescription,
        notes,
      } = req.body;

      // Validate required fields
      if (
        !departmentID ||
        !appointmentDate ||
        !appointmentTime ||
        !customerID ||
        !issueDescription
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Validate notes length
      if (!notes || notes.length < 10 || notes.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Notes must be between 10 and 500 characters",
        });
      }

      // Create appointment datetime
      const appointmentDateTime = moment(
        `${appointmentDate} ${appointmentTime}`
      );

      // Validate appointment datetime
      if (!appointmentDateTime.isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment date or time",
        });
      }

      // Check if date is in the past
      if (appointmentDateTime.isBefore(moment(), "minute")) {
        return res.status(400).json({
          success: false,
          message: "Cannot book appointments in the past",
        });
      }

      // Check if it's a weekend
      if (appointmentDateTime.day() === 0 || appointmentDateTime.day() === 6) {
        return res.status(400).json({
          success: false,
          message: "Appointments are not available on weekends",
        });
      }

      // Check availability
      const startTime = appointmentDateTime.clone().startOf("hour");
      const endTime = appointmentDateTime.clone().endOf("hour");

      const existingAppointment = await Ticket.findOne({
        departmentID,
        appointmentDateTime: {
          $gte: startTime.toDate(),
          $lte: endTime.toDate(),
        },
        status: { $nin: ["Rejected", "Cancelled"] },
      });

      if (existingAppointment) {
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked",
        });
      }

      // Create and save the ticket
      const ticket = new Ticket({
        customerID,
        departmentID,
        issueDescription,
        notes,
        appointmentDate,
        appointmentTime,
        appointmentDateTime: appointmentDateTime.toDate(),
        status: "Pending",
        createdDate: new Date(),
      });

      await ticket.save();

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        ticket,
      });
    } catch (err) {
      console.error("Error creating ticket:", err);
      res.status(400).json({
        success: false,
        message: "Error booking appointment",
        error: err.message,
      });
    }
  }

  async getTickets(req, res) {
    try {
      const tickets = await Ticket.find()
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName")
        .sort({ appointmentDateTime: -1 });

      res.json({
        success: true,
        tickets,
      });
    } catch (err) {
      console.error("Error fetching tickets:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching tickets",
        error: err.message,
      });
    }
  }

  async getTicketById(req, res) {
    const { id } = req.params;
    try {
      const ticket = await Ticket.findById(id)
        .populate("customerID", "firstName lastName emailAddress")
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName");

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      res.json({
        success: true,
        ticket,
      });
    } catch (err) {
      console.error("Error fetching ticket:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching ticket",
        error: err.message,
      });
    }
  }

  async updateTicket(req, res) {
    const { id } = req.params;
    try {
      let ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      // If updating appointment date/time, validate availability
      if (req.body.appointmentDate || req.body.appointmentTime) {
        const appointmentDateTime = moment(
          `${req.body.appointmentDate || ticket.appointmentDate} ${
            req.body.appointmentTime || ticket.appointmentTime
          }`
        );

        const startTime = appointmentDateTime.clone().startOf("hour");
        const endTime = appointmentDateTime.clone().endOf("hour");

        const existingAppointment = await Ticket.findOne({
          _id: { $ne: id },
          departmentID: ticket.departmentID,
          appointmentDateTime: {
            $gte: startTime.toDate(),
            $lte: endTime.toDate(),
          },
          status: { $nin: ["Rejected", "Cancelled"] },
        });

        if (existingAppointment) {
          return res.status(409).json({
            success: false,
            message: "This time slot is already booked",
          });
        }

        if (req.body.appointmentDate && req.body.appointmentTime) {
          req.body.appointmentDateTime = appointmentDateTime.toDate();
        }
      }

      // Update status and set closed date if applicable
      if (
        req.body.status === "Approved" ||
        req.body.status === "Rejected" ||
        req.body.status === "Cancelled"
      ) {
        req.body.closedDate = new Date();
      }

      Object.assign(ticket, req.body);
      await ticket.save();

      res.json({
        success: true,
        message: "Ticket updated successfully",
        ticket,
      });
    } catch (err) {
      console.error("Error updating ticket:", err);
      res.status(500).json({
        success: false,
        message: "Error updating ticket",
        error: err.message,
      });
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
      let ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      ticket.status = "Rejected";
      ticket.rejectionReason = rejectionReason;
      ticket.closedDate = new Date();
      if (staffID) ticket.staffID = staffID;

      await ticket.save();

      res.json({
        success: true,
        message: "Ticket rejected successfully",
        ticket,
      });
    } catch (err) {
      console.error("Error rejecting ticket:", err);
      res.status(500).json({
        success: false,
        message: "Error rejecting ticket",
        error: err.message,
      });
    }
  }

  async deleteTicket(req, res) {
    const { id } = req.params;
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      // Instead of hard delete, set status to cancelled
      ticket.status = "Cancelled";
      ticket.closedDate = new Date();
      await ticket.save();

      res.json({
        success: true,
        message: "Ticket cancelled successfully",
      });
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      res.status(500).json({
        success: false,
        message: "Error cancelling ticket",
        error: err.message,
      });
    }
  }

  async getCustomerTickets(req, res) {
    const { customerID } = req.params;
    try {
      const tickets = await Ticket.find({ customerID })
        .populate("departmentID", "departmentName")
        .populate("staffID", "firstName lastName")
        .sort({ appointmentDateTime: -1 });

      res.json({
        success: true,
        tickets,
      });
    } catch (err) {
      console.error("Error fetching customer tickets:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching customer tickets",
        error: err.message,
      });
    }
  }

  async getDepartmentTickets(req, res) {
    const { departmentID } = req.params;
    try {
      const tickets = await Ticket.find({ departmentID })
        .populate("customerID", "firstName lastName emailAddress")
        .populate("staffID", "firstName lastName")
        .sort({ appointmentDateTime: -1 });

      res.json({
        success: true,
        tickets,
      });
    } catch (err) {
      console.error("Error fetching department tickets:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching department tickets",
        error: err.message,
      });
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

      res.json({
        success: true,
        tickets: recentRejectedTickets,
      });
    } catch (err) {
      console.error("Error fetching recent rejected tickets:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching recent rejected tickets",
        error: err.message,
      });
    }
  }
}

module.exports = new TicketController();
