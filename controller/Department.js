// controllers/DepartmentController.js

const { Department } = require("../model/Department");

class DepartmentController {
    /**
     * @swagger
     * /api/departments:
     *   post:
     *     summary: Add a new department
     *     tags: [Departments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/DepartmentInput'
     *           example:
     *             departmentName: "Human Resources"
     *     responses:
     *       201:
     *         description: Department added successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       400:
     *         description: Error adding department
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async addDepartment(req, res) {
        const department = new Department(req.body);
        try {
            await department.save();
            res.status(201).json({ success: true });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    /**
     * @swagger
     * /api/departments:
     *   get:
     *     summary: Retrieve a list of all departments
     *     tags: [Departments]
     *     responses:
     *       200:
     *         description: A list of departments
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Department'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getDepartments(req, res) {
        try {
            const departments = await Department.find();
            res.json(departments);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/departments/{id}:
     *   get:
     *     summary: Retrieve a single department by ID
     *     tags: [Departments]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The department ID
     *     responses:
     *       200:
     *         description: Department details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Department'
     *       404:
     *         description: Department not found
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
    async getDepartmentById(req, res) {
        const { id } = req.params;
        try {
            const department = await Department.findById(id);
            if (!department) return res.status(404).json({ message: 'Department not found' });

            res.json(department);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/departments/{id}:
     *   put:
     *     summary: Update an existing department
     *     tags: [Departments]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The department ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/DepartmentInput'
     *           example:
     *             departmentName: "Finance"
     *     responses:
     *       200:
     *         description: Department updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Department not found
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
    async updateDepartment(req, res) {
        const { id } = req.params;

        try {
            let department = await Department.findById(id);
            if (!department) return res.status(404).json({ message: 'Department not found' });

            Object.assign(department, req.body);

            await department.save();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * @swagger
     * /api/departments/{id}:
     *   delete:
     *     summary: Delete a department by ID
     *     tags: [Departments]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The department ID
     *     responses:
     *       200:
     *         description: Department deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Department not found
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
    async deleteDepartment(req, res) {
        const { id } = req.params;

        try {
            const department = await Department.findByIdAndDelete(id);
            if (!department) return res.status(404).json({ message: 'Department not found' });

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new DepartmentController();
