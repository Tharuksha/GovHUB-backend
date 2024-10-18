const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");

// Create a new message
router.post("/", messageController.createMessage);

// Get all messages
router.get("/", messageController.getAllMessages);

// Get recent messages
router.get("/recent", messageController.getRecentMessages);

module.exports = router;
