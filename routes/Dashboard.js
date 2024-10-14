const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/Dashboard');

// Get count of Departments
router.get('/departments/count', dashboardController.getDepartmentCount);

// Get count of Solved Tickets
router.get('/tickets/solved/count', dashboardController.getSolvedTicketCount);

// Get count of Staff
router.get('/staff/count', dashboardController.getStaffCount);

// Get count of Customers
router.get('/customers/count', dashboardController.getCustomerCount);

// Get count of Tickets solved by a specific Staff member
router.post('/staff/solvedTickets/:staffID', dashboardController.getStaffSolvedTicketCount);

// Get count of Tickets solved
router.post('/staff/solvedTickets', dashboardController.getAllStaffSolvedTicketCounts);

// Get count of Tickets solved department wise
router.get('/departments/solvedTickets', dashboardController.getSolvedTicketsByDepartment);

// Get solved and pending ticket counts
router.get('/tickets/solvedTickets', dashboardController.getSolvedAndPendingTicketCounts);

// Get solved ticket counts date-wise for the current week
router.get('/tickets/solvedAndPendingTickets', dashboardController.getTicketCountsOverTime);

// Get recently solved ticket details by a specific staff member
router.get('/staff/recentSolvedTickets/:staffID', dashboardController.getRecentlySolvedTicketByStaff);

// Get all solved ticket details by a specific staff member
router.get('/staff/solvedTicketsHistory/:staffID', dashboardController.getAllSolvedTicketsByStaff);

// Get weekly, monthly, and yearly performance of a specific staff member
router.post('/staff/performance', dashboardController.getStaffPerformance);


module.exports = router;
 