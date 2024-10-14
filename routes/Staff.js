const express = require('express');
const router = express.Router();
const staffController = require('../controller/Staff');

// Add a new staff member
router.post('/', staffController.addStaff);

// Get all staff members
router.get('/', staffController.getStaff);

// staff members login
router.post('/login', staffController.login);

// Get a single staff member by ID
router.get('/:id', staffController.getStaffById);

// Update a staff member
router.put('/:id', staffController.updateStaff);

// Delete a staff member
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
