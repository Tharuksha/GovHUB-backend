const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
