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
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
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
    required: true,
  },
  appointmentDateTime: {
    type: Date,
    required: true,
  },
  closedDate: {
    type: Date,
  },
  notes: {
    type: String,
    required: true,
    minlength: [10, "Notes must be at least 10 characters long"],
    maxlength: [500, "Notes cannot exceed 500 characters"],
  },
  feedback: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
});

// Add index for faster availability checks
ticketSchema.index({ departmentID: 1, appointmentDateTime: 1, status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = { Ticket };
