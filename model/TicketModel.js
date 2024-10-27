// models/TicketModel.js

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  customerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  staffID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  issueDescription: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
  },
  appointmentDateTime: {
    type: Date,
  },
  closedDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  feedback: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
});

// Add indexes for better query performance
ticketSchema.index({ appointmentDate: 1, appointmentTime: 1, status: 1 });
ticketSchema.index({ appointmentDateTime: 1, status: 1 });
ticketSchema.index({ customerID: 1, appointmentDate: 1 });
ticketSchema.index({ staffID: 1, status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = { Ticket };
