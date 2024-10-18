const express = require("express");
const router = express.Router();
const announcementController = require("../controller/announcementController");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have an auth middleware

router.get(
  "/:departmentID",
  announcementController.getAnnouncementsByDepartment
);
router.post("/", authMiddleware, announcementController.createAnnouncement);
router.delete(
  "/:id",
  authMiddleware,
  announcementController.deleteAnnouncement
);

module.exports = router;
