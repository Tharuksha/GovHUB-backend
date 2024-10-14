const express = require('express');
const router = express.Router();
const departmentController = require('../controller/Department');

// Add a new department
router.post('/', departmentController.addDepartment);

// Get all departments
router.get('/', departmentController.getDepartments);

// Get a single department by ID
router.get('/:id', departmentController.getDepartmentById);

// Update a department
router.put('/:id', departmentController.updateDepartment);

// Delete a department
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
