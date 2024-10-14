const express = require('express');
const router = express.Router();
const customerController = require('../controller/Customer');

// Add a new customer
router.post('/', customerController.addCustomer);

// Customer login
router.post('/login', customerController.login);

// Get all customers
router.get('/', customerController.getCustomers);

// Get a single customer by ID
router.get('/:id', customerController.getCustomerById);

// Get a single customer by e-mail
router.get('/email/:email', customerController.getCustomerByEmail);

// Update a customer
router.put('/:id', customerController.updateCustomer);

// Delete a customer
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
