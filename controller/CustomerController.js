const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Customer } = require("../model/CustomerModel");
const { sendWelcomeEmail } = require("../services/emailService");

class CustomerController {
  /**
   * @swagger
   * /api/customers:
   *   post:
   *     summary: Add a new customer
   *     tags: [Customers]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - emailAddress
   *               - password
   *             properties:
   *               emailAddress:
   *                 type: string
   *                 description: The customer's email address
   *               password:
   *                 type: string
   *                 description: The customer's password
   *     responses:
   *       201:
   *         description: Customer added successfully
   *       400:
   *         description: Error adding customer
   */
  async addCustomer(req, res) {
    try {
      const customer = new Customer(req.body);
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(customer.password, salt);
      await customer.save();

      // Send welcome email
      await sendWelcomeEmail(customer.emailAddress, customer.firstName);

      res
        .status(201)
        .json({ message: "Customer added successfully", customer });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/customers:
   *   get:
   *     summary: Retrieve a list of all customers
   *     tags: [Customers]
   *     responses:
   *       200:
   *         description: A list of customers
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Customer'
   *       500:
   *         description: Internal server error
   */
  async getCustomers(req, res) {
    try {
      const customers = await Customer.find();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/customers/{id}:
   *   get:
   *     summary: Retrieve a single customer by ID
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The customer ID
   *     responses:
   *       200:
   *         description: The customer details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Customer'
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async getCustomerById(req, res) {
    const { id } = req.params;
    try {
      const customer = await Customer.findById(id);
      if (!customer)
        return res.status(404).json({ message: "Customer not found" });

      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/customers/email/{email}:
   *   get:
   *     summary: Retrieve a customer by email address
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *         description: The customer's email address
   *     responses:
   *       200:
   *         description: The customer details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Customer'
   *       404:
   *         description: Customer not found
   *       400:
   *         description: Bad request
   */
  async getCustomerByEmail(req, res) {
    try {
      const { email } = req.params;
      const customer = await Customer.findOne({ emailAddress: email });

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.status(200).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/customers/{id}:
   *   put:
   *     summary: Update a customer
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The customer ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Customer updated successfully
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async updateCustomer(req, res) {
    const { id } = req.params;

    try {
      let customer = await Customer.findById(id);
      if (!customer)
        return res.status(404).json({ message: "Customer not found" });

      Object.assign(customer, req.body);

      await customer.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/customers/{id}:
   *   delete:
   *     summary: Delete a customer by ID
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The customer ID
   *     responses:
   *       200:
   *         description: Customer deleted successfully
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async deleteCustomer(req, res) {
    const { id } = req.params;

    try {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer)
        return res.status(404).json({ message: "Customer not found" });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * @swagger
   * /api/customers/login:
   *   post:
   *     summary: Customer login
   *     tags: [Customers]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 description: The customer's email address
   *               password:
   *                 type: string
   *                 description: The customer's password
   *     responses:
   *       200:
   *         description: Login successful, returns a JWT token
   *       400:
   *         description: Invalid credentials
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async login(req, res) {
    const { email, password } = req.body;

    try {
      const customer = await Customer.findOne({ emailAddress: email });
      if (!customer)
        return res.status(404).json({ message: "Customer not found" });

      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: customer._id, email: customer.emailAddress },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ token, email: customer.emailAddress });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CustomerController();
