const express = require("express");
const router = express.Router();
const ticketController = require("../controller/Ticket");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Add a new ticket
 *     tags: [Tickets]
 */
router.post("/", ticketController.addTicket);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Retrieve a list of all tickets
 *     tags: [Tickets]
 */
router.get("/", ticketController.getTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Retrieve a single ticket by ID
 *     tags: [Tickets]
 */
router.get("/:id", ticketController.getTicketById);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update an existing ticket
 *     tags: [Tickets]
 */
router.put("/:id", ticketController.updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/reject:
 *   put:
 *     summary: Reject a ticket
 *     tags: [Tickets]
 */
router.put("/:id/reject", ticketController.rejectTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket by ID
 *     tags: [Tickets]
 */
router.delete("/:id", ticketController.deleteTicket);

module.exports = router;
