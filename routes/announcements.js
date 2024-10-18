const express = require("express");
const router = express.Router();
const announcementController = require("../controller/announcementController");

// Get announcements for a specific department
router.get(
  "/:departmentID",
  announcementController.getAnnouncementsByDepartment
);

// Post a new announcement
router.post("/", announcementController.createAnnouncement);

module.exports = router;
