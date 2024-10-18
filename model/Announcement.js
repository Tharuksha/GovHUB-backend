const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = { Announcement };
