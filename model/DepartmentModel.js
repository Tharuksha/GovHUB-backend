const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
  },
  departmentDescription: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  departmentHeadID: {
    type: String,
  },
  operatingHours: {
    type: String,
    required: true,
  },
  appointmentReasons: {
    type: [String],
    default: [],
  },
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = { Department };
