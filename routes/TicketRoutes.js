// routes/TicketRoutes.js

const express = require("express");
const router = express.Router();
const ticketController = require("../controller/TicketController");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /api/tickets/check-availability:
 *   post:
 *     summary: Check availability of a specific time slot within a 15-minute window
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date in YYYY-MM-DD format
 *               time:
 *                 type: string
 *                 description: Time in HH:mm format
 *     responses:
 *       200:
 *         description: Availability status of the slot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/check-availability", ticketController.checkAvailability);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Add a new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketInput'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Error creating ticket
 *       500:
 *         description: Internal server error
 */
router.post("/", ticketController.addTicket);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Retrieve a list of all tickets
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: A list of tickets
 *       500:
 *         description: Internal server error
 */
router.get("/", ticketController.getTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Retrieve a single ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", ticketController.getTicketById);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update an existing ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketUpdateInput'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", ticketController.updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/reject:
 *   put:
 *     summary: Reject a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *               staffID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket rejected successfully
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/reject", ticketController.rejectTicket);
/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", ticketController.deleteTicket);

/**
 * @swagger
 * /api/tickets/recentRejected/{staffId}:
 *   get:
 *     summary: Retrieve recent rejected tickets for a staff member
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of recent rejected tickets
 *       500:
 *         description: Internal server error
 */
router.get(
  "/recentRejected/:staffId",
  ticketController.getRecentRejectedTickets
);

module.exports = router;
