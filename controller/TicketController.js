// controllers/TicketController.js

const { Ticket } = require("../model/TicketModel");
const moment = require("moment");

class TicketController {
  /**
   * Check if a specific time slot is available within a 15-minute window
   */
  async checkAvailability(req, res) {
    const { date, time } = req.body;
    try {
      // Convert date and time to a moment object
      const requestedDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

      // Find any appointments for this date and time
      const existingAppointment = await Ticket.findOne({
        $or: [
          {
            appointmentDateTime: requestedDateTime.toDate(),
          },
          {
            appointmentDate: moment(date).startOf("day").toDate(),
            appointmentTime: time,
          },
        ],
        status: { $ne: "Rejected" },
      });

      if (existingAppointment) {
        return res.json({
          available: false,
          message: "This slot is already booked.",
        });
      }

      return res.json({
        available: true,
        message: "Time slot is available",
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({
        success: false,
        error: "Server error occurred.",
      });
    }
  }

  /**
   * Add a new ticket with validations
   */
  async addTicket(req, res) {
    const ticketData = req.body;
    const bookingTime = moment(
      ticketData.appointmentDateTime ||
        `${ticketData.appointmentDate} ${ticketData.appointmentTime}`
    );

    const OPENING_HOUR = 9;
    const CLOSING_HOUR = 17;
    const bookingHour = bookingTime.hour();

    if (bookingHour < OPENING_HOUR || bookingHour >= CLOSING_HOUR) {
      return res.status(400).json({
        success: false,
        message: "Booking must be within operating hours.",
      });
    }

    try {
      // Check for existing appointments
      const existingAppointment = await Ticket.findOne({
        $or: [
          {
            appointmentDateTime: bookingTime.toDate(),
          },
          {
            appointmentDate: bookingTime.startOf("day").toDate(),
            appointmentTime: bookingTime.format("HH:mm:ss"),
          },
        ],
        status: { $ne: "Rejected" },
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: "This slot is already booked.",
        });
      }

      // Save ticket if slot is available
      const newTicket = new Ticket({
        ...ticketData,
        appointmentDateTime: bookingTime.toDate(),
        appointmentDate: bookingTime.startOf("day").toDate(),
        appointmentTime: bookingTime.format("HH:mm:ss"),
      });

      await newTicket.save();

      res.status(201).json({
        success: true,
        message: "Ticket created successfully",
      });
    } catch (err) {
      console.error("Error creating ticket:", err);
      res.status(500).json({
        success: false,
        error: "Server error occurred.",
      });
    }
  }

  /**
   * Retrieve all tickets
   */
  async getTickets(req, res) {
    try {
      const tickets = await Ticket.find().sort({ appointmentDate: -1 }).lean(); // Use lean() to get plain JavaScript objects

      // Format the response to match the required structure
      const formattedTickets = tickets.map((ticket) => ({
        _id: ticket._id,
        customerID: ticket.customerID,
        departmentID: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        createdDate: ticket.createdDate,
        appointmentDate: ticket.appointmentDate,
        notes: ticket.notes,
        __v: ticket.__v,
        ...(ticket.closedDate && { closedDate: ticket.closedDate }),
        ...(ticket.feedback && { feedback: ticket.feedback }),
        ...(ticket.staffID && { staffID: ticket.staffID }),
        ...(ticket.appointmentTime && {
          appointmentTime: ticket.appointmentTime,
        }),
        ...(ticket.appointmentDateTime && {
          appointmentDateTime: ticket.appointmentDateTime,
        }),
      }));

      res.json(formattedTickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Retrieve a single ticket by ID
   */
  async getTicketById(req, res) {
    const { id } = req.params;
    try {
      const ticket = await Ticket.findById(id).lean();

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      // Format the response to match the required structure
      const formattedTicket = {
        _id: ticket._id,
        customerID: ticket.customerID,
        departmentID: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        createdDate: ticket.createdDate,
        appointmentDate: ticket.appointmentDate,
        notes: ticket.notes,
        __v: ticket.__v,
        ...(ticket.closedDate && { closedDate: ticket.closedDate }),
        ...(ticket.feedback && { feedback: ticket.feedback }),
        ...(ticket.staffID && { staffID: ticket.staffID }),
        ...(ticket.appointmentTime && {
          appointmentTime: ticket.appointmentTime,
        }),
        ...(ticket.appointmentDateTime && {
          appointmentDateTime: ticket.appointmentDateTime,
        }),
      };

      res.json(formattedTicket);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Update an existing ticket
   */
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

      // Handle status changes
      if (
        req.body.status &&
        ["Approved", "Rejected"].includes(req.body.status)
      ) {
        ticket.closedDate = new Date();
      }

      Object.assign(ticket, req.body);

      if (req.body.appointmentDateTime) {
        const newTime = moment(req.body.appointmentDateTime);
        ticket.appointmentDate = newTime.startOf("day").toDate();
        ticket.appointmentTime = newTime.format("HH:mm:ss");
      }

      await ticket.save();
      res.json({
        success: true,
        message: "Ticket updated successfully",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Delete a ticket by ID
   */
  async deleteTicket(req, res) {
    const { id } = req.params;

    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      res.json({
        success: true,
        message: "Ticket deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Retrieve recent rejected tickets for a specific staff member
   */
  async getRecentRejectedTickets(req, res) {
    const { staffId } = req.params;
    try {
      const tickets = await Ticket.find({
        staffID: staffId,
        status: "Rejected",
      })
        .sort({ closedDate: -1 })
        .limit(5)
        .lean();

      // Format the response to match the required structure
      const formattedTickets = tickets.map((ticket) => ({
        _id: ticket._id,
        customerID: ticket.customerID,
        departmentID: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        createdDate: ticket.createdDate,
        appointmentDate: ticket.appointmentDate,
        notes: ticket.notes,
        __v: ticket.__v,
        ...(ticket.closedDate && { closedDate: ticket.closedDate }),
        ...(ticket.feedback && { feedback: ticket.feedback }),
        ...(ticket.staffID && { staffID: ticket.staffID }),
        ...(ticket.appointmentTime && {
          appointmentTime: ticket.appointmentTime,
        }),
        ...(ticket.appointmentDateTime && {
          appointmentDateTime: ticket.appointmentDateTime,
        }),
      }));

      res.json(formattedTickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TicketController();
