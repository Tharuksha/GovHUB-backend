const express = require("express");
const router = express.Router();
const announcementController = require("../controller/Announcement");

// Create a new announcement
router.post("/", announcementController.createAnnouncement);

// Get announcements for a specific department
router.get(
  "/:departmentID",
  announcementController.getAnnouncementsByDepartment
);

// Add more routes as needed

module.exports = router;
