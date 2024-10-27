const { Ticket } = require("../model/TicketModel");
const moment = require("moment");

class TicketController {
  /**
   * Check if a specific time slot is available
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
   * Add a new ticket
   */
  async addTicket(req, res) {
    const ticketData = req.body;
    const bookingTime = moment(
      ticketData.appointmentDateTime ||
        `${ticketData.appointmentDate} ${ticketData.appointmentTime}`
    );

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
      const tickets = await Ticket.find()
        .sort({ appointmentDateTime: -1 })
        .lean();

      const formattedTickets = tickets.map((ticket) => ({
        _id: ticket._id,
        customerID: ticket.customerID,
        departmentID: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        createdDate: ticket.createdDate,
        appointmentDate: ticket.appointmentDate,
        appointmentTime: ticket.appointmentTime,
        appointmentDateTime: ticket.appointmentDateTime,
        notes: ticket.notes,
        __v: ticket.__v,
        ...(ticket.closedDate && { closedDate: ticket.closedDate }),
        ...(ticket.feedback && { feedback: ticket.feedback }),
        ...(ticket.staffID && { staffID: ticket.staffID }),
      }));

      res.json(formattedTickets);
    } catch (err) {
      console.error("Error retrieving tickets:", err);
      res.status(500).json({
        success: false,
        error: "Server error occurred while retrieving tickets.",
      });
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

      const formattedTicket = {
        _id: ticket._id,
        customerID: ticket.customerID,
        departmentID: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        createdDate: ticket.createdDate,
        appointmentDate: ticket.appointmentDate,
        appointmentTime: ticket.appointmentTime,
        appointmentDateTime: ticket.appointmentDateTime,
        notes: ticket.notes,
        __v: ticket.__v,
        ...(ticket.closedDate && { closedDate: ticket.closedDate }),
        ...(ticket.feedback && { feedback: ticket.feedback }),
        ...(ticket.staffID && { staffID: ticket.staffID }),
      };

      res.json(formattedTicket);
    } catch (err) {
      console.error("Error retrieving ticket:", err);
      res.status(500).json({
        success: false,
        error: "Server error occurred while retrieving the ticket.",
      });
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

      // If updating appointment time
      if (req.body.appointmentDateTime) {
        const newTime = moment(req.body.appointmentDateTime);

        // Check for existing appointments at the new time
        const existingAppointment = await Ticket.findOne({
          _id: { $ne: id }, // Exclude current ticket
          $or: [
            {
              appointmentDateTime: newTime.toDate(),
            },
            {
              appointmentDate: newTime.startOf("day").toDate(),
              appointmentTime: newTime.format("HH:mm:ss"),
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

        ticket.appointmentDate = newTime.startOf("day").toDate();
        ticket.appointmentTime = newTime.format("HH:mm:ss");
        ticket.appointmentDateTime = newTime.toDate();
      }

      // Handle status changes
      if (
        req.body.status &&
        ["Approved", "Rejected"].includes(req.body.status)
      ) {
        ticket.closedDate = new Date();
      }

      // Update other fields
      Object.assign(ticket, req.body);

      await ticket.save();
      res.json({
        success: true,
        message: "Ticket updated successfully",
      });
    } catch (err) {
      console.error("Error updating ticket:", err);
      res.status(500).json({
        success: false,
        error: "Server error occurred while updating the ticket.",
      });
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
      console.error("Error deleting ticket:", err);
      res.status(500).json({
        success: false,
        error: "Server error occurred while deleting the ticket.",
      });
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

      const formattedTickets = tickets.map((ticket) => ({
        _id: ticket._id,
        customerID: ticket.customerID,
        departmentID: ticket.departmentID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        createdDate: ticket.createdDate,
        appointmentDate: ticket.appointmentDate,
        appointmentTime: ticket.appointmentTime,
        appointmentDateTime: ticket.appointmentDateTime,
        notes: ticket.notes,
        __v: ticket.__v,
        ...(ticket.closedDate && { closedDate: ticket.closedDate }),
        ...(ticket.feedback && { feedback: ticket.feedback }),
        ...(ticket.staffID && { staffID: ticket.staffID }),
      }));

      res.json(formattedTickets);
    } catch (err) {
      console.error("Error retrieving rejected tickets:", err);
      res.status(500).json({
        success: false,
        error: "Server error occurred while retrieving rejected tickets.",
      });
    }
  }
}

module.exports = new TicketController();
