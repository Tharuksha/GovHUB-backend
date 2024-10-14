const express = require('express');
const router = express.Router();
const ticketController = require('../controller/Ticket');

// Add a new ticket
router.post('/', ticketController.addTicket);

// Get all tickets
router.get('/', ticketController.getTickets);

// Get a single ticket by ID
router.get('/:id', ticketController.getTicketById);

// Update a ticket
router.put('/:id', ticketController.updateTicket);

// Delete a ticket
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
