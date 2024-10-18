// routes/announcement.js
const express = require("express");
const router = express.Router();
const AnnouncementController = require("../controller/Announcement");

router.get("/", AnnouncementController.getAnnouncements);
router.post("/", AnnouncementController.createAnnouncement);

module.exports = router;
