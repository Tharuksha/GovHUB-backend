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

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = { Ticket };
