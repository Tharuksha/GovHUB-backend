// controllers/StaffController.js

const { Staff } = require("../model/Staff");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class StaffController {
    /**
     * @swagger
     * /api/staff:
     *   post:
     *     summary: Add a new staff member
     *     tags: [Staff]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StaffInput'
     *           example:
     *             firstName: "John"
     *             lastName: "Doe"
     *             dateOfBirth: "1990-01-01"
     *             gender: "Male"
     *             phoneNumber: "+1234567890"
     *             emailAddress: "john.doe@example.com"
     *             address: "123 Main St, Anytown, USA"
     *             employeeID: "EMP001"
     *             departmentID: "60c72b2f9b1e8c001f5f7c70"
     *             password: "securePassword123"
     *             role: "Manager"
     *             hireDate: "2020-06-15"
     *             permission: "full"
     *     responses:
     *       201:
     *         description: Staff member added successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       400:
     *         description: Error adding staff member
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async addStaff(req, res) {
        try {
            // Encrypt the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            // Create a new Staff object
            const staff = new Staff({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateOfBirth: req.body.dateOfBirth,
                gender: req.body.gender,
                phoneNumber: req.body.phoneNumber,
                emailAddress: req.body.emailAddress,
                address: req.body.address,
                employeeID: req.body.employeeID,
                departmentID: req.body.departmentID,
                password: hashedPassword,
                role: req.body.role,
                hireDate: req.body.hireDate,
                permission: req.body.permission,
            });

            // Save the staff object
            await staff.save();
            res.status(201).json({ success: true, message: 'Staff member added successfully' });
        } catch (err) {
            // Handle validation or other errors
            if (err.code === 11000) {
                // Duplicate email
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            res.status(500).json({ success: false, error: err.message });
        }
    }

    /**
     * @swagger
     * /api/staff/login:
     *   post:
     *     summary: Staff member login
     *     tags: [Staff]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StaffLoginInput'
     *           example:
     *             email: "john.doe@example.com"
     *             password: "securePassword123"
     *     responses:
     *       200:
     *         description: Login successful, returns a JWT token and staff details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Login successful"
     *                 token:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                 staff:
     *                   $ref: '#/components/schemas/StaffDetails'
     *       400:
     *         description: Invalid email or password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async login(req, res) {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide both email and password' });
        }

        try {
            // Find the staff member by email
            const staff = await Staff.findOne({ 'emailAddress': email });
            if (!staff) {
                return res.status(400).json({ success: false, message: 'Invalid email' });
            }

            // Compare the provided password with the hashed password
            const isMatch = await bcrypt.compare(password, staff.password); 
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid password' });
            }

            // Generate a token (optional)
            const token = jwt.sign(
                { id: staff._id, email: staff.emailAddress },
                process.env.JWT_SECRET, // Make sure to set this in your .env file
                { expiresIn: '1h' } // Token expiry time
            );

            // Send the response with token and staff details
            res.json({
                success: true,
                message: 'Login successful',
                token,
                staff: {
                    id: staff._id,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    email: staff.emailAddress,
                    phoneNumber: staff.phoneNumber,
                    departmentID: staff.departmentID,
                    role: staff.role,
                    hireDate: staff.hireDate,
                    permission: staff.permission,
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    /**
     * @swagger
     * /api/staff:
     *   get:
     *     summary: Retrieve a list of all staff members
     *     tags: [Staff]
     *     responses:
     *       200:
     *         description: A list of staff members
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Staff'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getStaff(req, res) {
        try {
            const staff = await Staff.find();
            res.json(staff);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/staff/{id}:
     *   get:
     *     summary: Retrieve a single staff member by ID
     *     tags: [Staff]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The staff member ID
     *     responses:
     *       200:
     *         description: Staff member details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Staff'
     *       404:
     *         description: Staff member not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getStaffById(req, res) {
        const { id } = req.params;
        try {
            const staff = await Staff.findById(id);
            if (!staff) return res.status(404).json({ message: 'Staff not found' });

            res.json(staff);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/staff/{id}:
     *   put:
     *     summary: Update an existing staff member
     *     tags: [Staff]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The staff member ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StaffUpdateInput'
     *           example:
     *             firstName: "Jane"
     *             lastName: "Smith"
     *             phoneNumber: "+0987654321"
     *             role: "Senior Manager"
     *             password: "newSecurePassword456"
     *     responses:
     *       200:
     *         description: Staff member updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       404:
     *         description: Staff member not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async updateStaff(req, res) {
        const { id } = req.params;
        const { password } = req.body;

        try {
            let staff = await Staff.findById(id);
            if (!staff) return res.status(404).json({ message: 'Staff not found' });

            // If password is provided, hash it
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 12);
                req.body.password = hashedPassword;
            }

            // Update staff details
            Object.assign(staff, req.body);
            await staff.save();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


    /**
     * @swagger
     * /api/staff/{id}:
     *   delete:
     *     summary: Delete a staff member by ID
     *     tags: [Staff]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The staff member ID
     *     responses:
     *       200:
     *         description: Staff member deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       404:
     *         description: Staff member not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async deleteStaff(req, res) {
        const { id } = req.params;

        try {
            const staff = await Staff.findByIdAndDelete(id);
            if (!staff) return res.status(404).json({ message: 'Staff not found' });

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new StaffController();
