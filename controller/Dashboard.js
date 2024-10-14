const { Department } = require("../model/Department");
const { Ticket } = require("../model/Ticket");
const { Staff } = require("../model/Staff");
const { Customer } = require("../model/Customer");
const moment = require('moment');

class DashboardController {
    /**
     * @swagger
     * /api/Dashboard/departments/count:
     *   get:
     *     summary: Get the count of departments
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: The count of departments
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: integer
     *                   example: 5
     *       500:
     *         description: Internal server error
     */
    async getDepartmentCount(req, res) {
        try {
            const count = await Department.countDocuments();
            res.json({ count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/tickets/solved/count:
     *   get:
     *     summary: Get the count of solved tickets
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: The count of solved tickets
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: integer
     *                   example: 42
     *       500:
     *         description: Internal server error
     */
    async getSolvedTicketCount(req, res) {
        try {
            const count = await Ticket.countDocuments({ status: "Solved" });
            res.json({ count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/staff/count:
     *   get:
     *     summary: Get the count of staff members
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: The count of staff members
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: integer
     *                   example: 10
     *       500:
     *         description: Internal server error
     */
    async getStaffCount(req, res) {
        try {
            const count = await Staff.countDocuments();
            res.json({ count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/customers/count:
     *   get:
     *     summary: Get the count of customers
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: The count of customers
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: integer
     *                   example: 100
     *       500:
     *         description: Internal server error
     */
    async getCustomerCount(req, res) {
        try {
            const count = await Customer.countDocuments();
            res.json({ count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/staff/{staffID}/solved-tickets/count:
     *   post:
     *     summary: Get the count of solved tickets by a specific staff member within a specific time duration
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: staffID
     *         schema:
     *           type: string
     *         required: true
     *         description: The staff ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               duration:
     *                 type: string
     *                 enum: [today, thisWeek, lastWeek, thisMonth, lastMonth, thisYear, lastYear]
     *                 default: today
     *                 description: The time duration for filtering solved tickets
     *             example:
     *               duration: thisMonth
     *     responses:
     *       200:
     *         description: The count of solved tickets by the staff member
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: integer
     *                   example: 15
     *       500:
     *         description: Internal server error
     */
    async getStaffSolvedTicketCount(req, res) {
        const { staffID } = req.params;
        const { duration = 'today' } = req.body;

        // Determine the date range based on the duration parameter
        let startDate, endDate;

        switch (duration) {
            case 'thisWeek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'lastWeek':
                startDate = moment().subtract(1, 'week').startOf('week').toDate();
                endDate = moment().subtract(1, 'week').endOf('week').toDate();
                break;
            case 'thisMonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'lastMonth':
                startDate = moment().subtract(1, 'month').startOf('month').toDate();
                endDate = moment().subtract(1, 'month').endOf('month').toDate();
                break;
            case 'thisYear':
                startDate = moment().startOf('year').toDate();
                endDate = moment().endOf('year').toDate();
                break;
            case 'lastYear':
                startDate = moment().subtract(1, 'year').startOf('year').toDate();
                endDate = moment().subtract(1, 'year').endOf('year').toDate();
                break;
            case 'today':
            default:
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
        }

        try {
            const count = await Ticket.countDocuments({
                staffID,
                status: "Solved",
                closedDate: { $gte: startDate, $lte: endDate }
            });

            res.json({ count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/tickets/staff/solved-counts:
     *   post:
     *     summary: Get the count of solved tickets by all staff members within a specific time duration
     *     tags: [Dashboard]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               duration:
     *                 type: string
     *                 enum: [today, thisWeek, lastWeek, thisMonth, lastMonth, thisYear, lastYear]
     *                 default: today
     *                 description: The time duration for filtering solved tickets
     *             example:
     *               duration: thisWeek
     *     responses:
     *       200:
     *         description: The count of solved tickets by all staff members
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   staffID:
     *                     type: string
     *                     example: "60c72b2f9b1e8c001f5f7c6f"
     *                   staffName:
     *                     type: string
     *                     example: "Jane Doe"
     *                   staffEmail:
     *                     type: string
     *                     format: email
     *                     example: "jane.doe@example.com"
     *                   staffRole:
     *                     type: string
     *                     example: "Support Engineer"
     *                   count:
     *                     type: integer
     *                     example: 8
     *       500:
     *         description: Internal server error
     */
    async getAllStaffSolvedTicketCounts(req, res) {
        const { duration = 'today' } = req.body;

        // Determine the date range based on the duration parameter
        let startDate, endDate;

        switch (duration) {
            case 'thisWeek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'lastWeek':
                startDate = moment().subtract(1, 'week').startOf('week').toDate();
                endDate = moment().subtract(1, 'week').endOf('week').toDate();
                break;
            case 'thisMonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'lastMonth':
                startDate = moment().subtract(1, 'month').startOf('month').toDate();
                endDate = moment().subtract(1, 'month').endOf('month').toDate();
                break;
            case 'thisYear':
                startDate = moment().startOf('year').toDate();
                endDate = moment().endOf('year').toDate();
                break;
            case 'lastYear':
                startDate = moment().subtract(1, 'year').startOf('year').toDate();
                endDate = moment().subtract(1, 'year').endOf('year').toDate();
                break;
            case 'today':
            default:
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
        }

        try {
            const solvedTicketCounts = await Ticket.aggregate([
                {
                    $match: {
                        status: "Solved",
                        closedDate: { $gte: startDate, $lte: endDate } // Filter by the date range
                    }
                },
                {
                    $group: {
                        _id: "$staffID", // Group by staffID
                        count: { $sum: 1 } // Count the number of solved tickets per staff member
                    }
                },
                {
                    $lookup: {
                        from: "staffs", // Assuming the staff collection is named "staffs"
                        localField: "_id", // The staffID field
                        foreignField: "_id", // The _id field in the staff collection
                        as: "staffDetails" // Output array containing staff details
                    }
                },
                { $unwind: "$staffDetails" }, // Unwind the staff details array
                {
                    $project: {
                        _id: 0, // Do not include the _id field in the output
                        staffID: "$_id", // Rename the _id field to staffID
                        staffName: { $concat: ["$staffDetails.firstName", " ", "$staffDetails.lastName"] }, // Include the staff name from staffDetails
                        staffEmail: "$staffDetails.emailAddress", // Include the staff email
                        staffRole: "$staffDetails.role", // Include the staff role
                        count: 1 // Include the count
                    }
                }
            ]);

            res.json(solvedTicketCounts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/tickets/solved/by-department:
     *   get:
     *     summary: Get the count of solved tickets by department
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: The count of solved tickets by department
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   departmentID:
     *                     type: string
     *                     example: "60c72b2f9b1e8c001f5f7c70"
     *                   departmentName:
     *                     type: string
     *                     example: "Human Resources"
     *                   count:
     *                     type: integer
     *                     example: 20
     *       500:
     *         description: Internal server error
     */
    async getSolvedTicketsByDepartment(req, res) {
        try {
            const departmentSolvedTickets = await Ticket.aggregate([
                {
                    $match: {
                        status: "Solved"
                    }
                },
                {
                    $group: {
                        _id: "$departmentID",
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "departments",
                        localField: "_id",
                        foreignField: "_id",
                        as: "departmentDetails"
                    }
                },
                { $unwind: "$departmentDetails" },
                {
                    $project: {
                        _id: 0,
                        departmentID: "$_id",
                        departmentName: "$departmentDetails.departmentName",
                        count: 1
                    }
                }
            ]);

            res.json(departmentSolvedTickets);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/tickets/status/counts:
     *   get:
     *     summary: Get counts of solved and pending tickets
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: Counts of solved and pending tickets
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 solved:
     *                   type: integer
     *                   example: 150
     *                 pending:
     *                   type: integer
     *                   example: 45
     *       500:
     *         description: Internal server error
     */
    async getSolvedAndPendingTicketCounts(req, res) {
        try {
            const ticketCounts = await Ticket.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1
                    }
                }
            ]);

            // Format the response to include both solved and pending counts
            const result = {
                solved: ticketCounts.find(ticket => ticket.status === 'Solved')?.count || 0,
                pending: ticketCounts.find(ticket => ticket.status === 'Pending')?.count || 0
            };

            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/tickets/counts-over-time:
     *   get:
     *     summary: Get solved and pending ticket counts date-wise for the current week
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: Ticket counts over time
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 dates:
     *                   type: array
     *                   items:
     *                     type: string
     *                     example: "Sun"
     *                 solvedCounts:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     example: 5
     *                 pendingCounts:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     example: 2
     *       500:
     *         description: Internal server error
     */
    async getTicketCountsOverTime(req, res) {
        try {
            const startDate = moment().startOf('week').toDate(); // Start of the current week
            const endDate = moment().endOf('week').toDate(); // End of the current week

            // Aggregate ticket data for the current week
            const ticketData = await Ticket.aggregate([
                {
                    $match: {
                        closedDate: { $gte: startDate, $lte: endDate } // Filter by the current week
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$closedDate" } },
                            status: "$status" // Group by date and status
                        },
                        count: { $sum: 1 } // Count the number of tickets per day and status
                    }
                },
                {
                    $sort: { "_id.date": 1 } // Sort by date in ascending order
                },
                {
                    $group: {
                        _id: "$_id.date", // Group by date
                        solvedCount: {
                            $sum: {
                                $cond: [{ $eq: ["$_id.status", "Solved"] }, "$count", 0]
                            }
                        },
                        pendingCount: {
                            $sum: {
                                $cond: [{ $eq: ["$_id.status", "Pending"] }, "$count", 0]
                            }
                        }
                    }
                },
                {
                    $sort: { _id: 1 } // Sort by date
                },
                {
                    $project: {
                        _id: 0, // Do not include the _id field in the output
                        date: "$_id", // Rename the _id field to date
                        solvedCount: 1, // Include the solvedCount
                        pendingCount: 1 // Include the pendingCount
                    }
                }
            ]);

            // Format the result for the chart
            const result = {
                dates: [],
                solvedCounts: [],
                pendingCounts: []
            };

            // Fill in missing days with zero counts
            const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const solvedCounts = Array(7).fill(0);
            const pendingCounts = Array(7).fill(0);

            ticketData.forEach(({ date, solvedCount, pendingCount }) => {
                const dayIndex = moment(date).day(); // Get the day of the week index
                solvedCounts[dayIndex] = solvedCount; // Set the solved count for the corresponding day
                pendingCounts[dayIndex] = pendingCount; // Set the pending count for the corresponding day
            });

            result.dates = allDays;
            result.solvedCounts = solvedCounts;
            result.pendingCounts = pendingCounts;

            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/staff/{staffID}/recently-solved-ticket:
     *   get:
     *     summary: Get the most recently solved ticket details by a specific staff member
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: staffID
     *         schema:
     *           type: string
     *         required: true
     *         description: The staff ID
     *     responses:
     *       200:
     *         description: Details of the most recently solved ticket
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Ticket'
     *       404:
     *         description: No solved tickets found for this staff member
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "No solved tickets found for this staff member."
     *       500:
     *         description: Internal server error
     */
    async getRecentlySolvedTicketByStaff(req, res) {
        const { staffID } = req.params;
        try {
            const recentlySolvedTicket = await Ticket.findOne({
                staffID: staffID,
                status: "Solved"
            })
                .sort({ closedDate: -1 }) // Sort by closedDate in descending order to get the most recent ticket
                .limit(1); // Limit to one result to get the last solved ticket

            if (recentlySolvedTicket) {
                res.json(recentlySolvedTicket);
            } else {
                res.status(404).json({ message: "No solved tickets found for this staff member." });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/staff/{staffID}/solved-tickets:
     *   get:
     *     summary: Get all solved ticket details by a specific staff member
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: staffID
     *         schema:
     *           type: string
     *         required: true
     *         description: The staff ID
     *     responses:
     *       200:
     *         description: A list of solved tickets by the staff member
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Ticket'
     *       500:
     *         description: Internal server error
     */
    async getAllSolvedTicketsByStaff(req, res) {
        const { staffID } = req.params;
        try {
            const solvedTickets = await Ticket.find({
                staffID: staffID,
                status: "Solved"
            });

            res.json(solvedTickets);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/Dashboard/staff/performance:
     *   get:
     *     summary: Get past 7 days performance of all staff members
     *     tags: [Dashboard]
     *     responses:
     *       200:
     *         description: Performance data of staff members over the past 7 days
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 staffID:
     *                   type: string
     *                   example: "60c72b2f9b1e8c001f5f7c6f"
     *                 days:
     *                   type: array
     *                   items:
     *                     type: string
     *                     example: "Sun"
     *                 count:
     *                   type: array
     *                   items:
     *                     type: integer
     *                     example: 3
     *       500:
     *         description: Internal server error
     */
    async getStaffPerformance(req, res) {
        // Determine the date range for the past 7 days, including today
        const startDate = moment().subtract(6, 'days').startOf('day').toDate();
        const endDate = moment().endOf('day').toDate();

        // Generate an array of all past 7 days in "YYYY-MM-DD" format
        const past7Days = [];
        for (let i = 0; i < 7; i++) {
            past7Days.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
        }
        past7Days.reverse(); // To maintain chronological order

        try {
            const performanceData = await Ticket.aggregate([
                {
                    $match: {
                        status: "Solved",
                        closedDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$closedDate" } },
                            staffID: "$staffID"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.date": 1 }
                }
            ]);

            // Transform the data into the desired format, including all past 7 days
            const result = performanceData.reduce((acc, cur) => {
                const staffID = cur._id.staffID;
                const date = cur._id.date;
                const count = cur.count;

                if (!acc[staffID]) {
                    acc[staffID] = { days: [...past7Days], count: Array(7).fill(0) };
                }

                const dayIndex = acc[staffID].days.indexOf(date);
                if (dayIndex !== -1) {
                    acc[staffID].count[dayIndex] = count;
                }

                return acc;
            }, {});

            res.json(result);
        } catch (err) {
            console.error("Error fetching performance data:", err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new DashboardController();
