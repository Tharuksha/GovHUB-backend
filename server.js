// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

dotenv.config();

const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Database connection
const PORT = process.env.PORT || 8070;
const MONGODB_URI = process.env.MONGODB_URI;
const CUSTOM_DB_NAME = process.env.CUSTOM_DB_NAME || "govDb"; // Fallback to a default DB name if not specified

// Construct full MongoDB URI
const fullMongoURI = `${MONGODB_URI}/${CUSTOM_DB_NAME}`; // Combine URI with the custom DB name

// Connect to MongoDB
mongoose
  .connect(fullMongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to MongoDB Atlas database: ${CUSTOM_DB_NAME}`);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

// Confirm database connection
mongoose.connection.once("open", () => {
  console.log("Database Synced");
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GovDB API Documentation",
      version: "1.0.0",
      description: "API documentation for the GovDB project",
    },
    servers: [
      {
        url: `https://govhub-backend.tharuksha.com`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        // Ticket Schemas
        Ticket: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the ticket",
            },
            title: { type: "string", description: "Title of the issue" },
            description: {
              type: "string",
              description: "Detailed description of the issue",
            },
            staffID: {
              type: "string",
              description: "ID of the staff assigned to the ticket",
            },
            departmentID: {
              type: "string",
              description: "ID of the department related to the ticket",
            },
            status: {
              type: "string",
              enum: ["Pending", "Approved", "Rejected"],
              description: "Current status of the ticket",
            },
            createdDate: {
              type: "string",
              format: "date-time",
              description: "Date and time when the ticket was created",
            },
            closedDate: {
              type: "string",
              format: "date-time",
              description: "Date and time when the ticket was closed",
            },
            // Add other relevant properties as needed
          },
          example: {
            id: "60c72b2f9b1e8c001f5f7c6e",
            title: "Issue with login",
            description: "Cannot log into the system with valid credentials.",
            staffID: "60c72b2f9b1e8c001f5f7c6f",
            departmentID: "60c72b2f9b1e8c001f5f7c70",
            status: "Pending",
            createdDate: "2024-10-01T09:00:00Z",
            closedDate: null,
            // Add other example properties as needed
          },
        },
        TicketInput: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the issue" },
            description: {
              type: "string",
              description: "Detailed description of the issue",
            },
            staffID: {
              type: "string",
              description: "ID of the staff assigned to the ticket",
            },
            departmentID: {
              type: "string",
              description: "ID of the department related to the ticket",
            },
            status: {
              type: "string",
              enum: ["Pending", "Approved", "Rejected"],
              description: "Current status of the ticket",
            },
            createdDate: {
              type: "string",
              format: "date-time",
              description: "Date and time when the ticket was created",
            },
            closedDate: {
              type: "string",
              format: "date-time",
              description: "Date and time when the ticket was closed",
            },
            // Add other relevant properties as needed
          },
          required: [
            "title",
            "description",
            "staffID",
            "departmentID",
            "status",
            "createdDate",
          ],
          example: {
            title: "Issue with login",
            description: "Cannot log into the system with valid credentials.",
            staffID: "60c72b2f9b1e8c001f5f7c6f",
            departmentID: "60c72b2f9b1e8c001f5f7c70",
            status: "Pending",
            createdDate: "2024-10-01T09:00:00Z",
            closedDate: null,
            // Add other example properties as needed
          },
        },
        TicketUpdateInput: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the issue" },
            description: {
              type: "string",
              description: "Detailed description of the issue",
            },
            staffID: {
              type: "string",
              description: "ID of the staff assigned to the ticket",
            },
            departmentID: {
              type: "string",
              description: "ID of the department related to the ticket",
            },
            status: {
              type: "string",
              enum: ["Pending", "Approved", "Rejected"],
              description: "Current status of the ticket",
            },
            createdDate: {
              type: "string",
              format: "date-time",
              description: "Date and time when the ticket was created",
            },
            closedDate: {
              type: "string",
              format: "date-time",
              description: "Date and time when the ticket was closed",
            },
            // Add other relevant properties as needed
          },
          example: {
            status: "Approved",
            closedDate: "2024-10-02T15:30:00Z",
            // Add other example properties as needed
          },
        },
        // Staff Schemas (Assuming already defined)
        Staff: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            phoneNumber: { type: "string" },
            emailAddress: { type: "string", format: "email" },
            address: { type: "string" },
            employeeID: { type: "string" },
            departmentID: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            hireDate: { type: "string", format: "date" },
            permission: { type: "string" },
            // Add other relevant properties as needed
          },
          example: {
            id: "60c72b2f9b1e8c001f5f7c6f",
            firstName: "Jane",
            lastName: "Doe",
            dateOfBirth: "1990-05-20",
            gender: "Female",
            phoneNumber: "+1234567890",
            emailAddress: "jane.doe@example.com",
            address: "456 Elm St, Othertown, USA",
            employeeID: "EMP002",
            departmentID: "60c72b2f9b1e8c001f5f7c70",
            password: "hashed_password",
            role: "Support Engineer",
            hireDate: "2021-01-15",
            permission: "full",
            // Add other example properties as needed
          },
        },
        // Department Schemas (Assuming already defined)
        Department: {
          type: "object",
          properties: {
            id: { type: "string" },
            departmentName: { type: "string" },
            // Add other relevant properties as needed
          },
          example: {
            id: "60c72b2f9b1e8c001f5f7c70",
            departmentName: "Human Resources",
            // Add other example properties as needed
          },
        },
        DepartmentInput: {
          type: "object",
          properties: {
            departmentName: { type: "string" },
            // Add other properties if needed
          },
          required: ["departmentName"],
          example: {
            departmentName: "Finance",
            // Add other example properties as needed
          },
        },
        // Customer Schemas (Assuming already defined)
        Customer: {
          type: "object",
          properties: {
            id: { type: "string" },
            emailAddress: { type: "string", format: "email" },
            password: { type: "string" },
            name: { type: "string" },
            phoneNumber: { type: "string" },
            // Add other relevant properties as needed
          },
          example: {
            id: "60c72b2f9b1e8c001f5f7c6e",
            emailAddress: "customer@example.com",
            password: "hashed_password",
            name: "John Doe",
            phoneNumber: "+123456789",
            // Add other example properties as needed
          },
        },
        // Error Response Schema
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            error: { type: "string" },
          },
          example: {
            message: "Ticket not found",
            error: "No ticket exists with the provided ID.",
          },
        },
        // Success Response Schema
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
          example: {
            success: true,
            message: "Ticket created successfully",
          },
        },
        // Ticket Details Schema (Optional if different from Ticket)
        TicketDetails: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            staffID: { type: "string" },
            departmentID: { type: "string" },
            status: {
              type: "string",
              enum: ["Pending", "Approved", "Rejected"],
            },
            createdDate: { type: "string", format: "date-time" },
            closedDate: { type: "string", format: "date-time" },
            // Add other relevant properties as needed
          },
          example: {
            id: "60c72b2f9b1e8c001f5f7c6e",
            title: "Issue with login",
            description: "Cannot log into the system with valid credentials.",
            staffID: "60c72b2f9b1e8c001f5f7c6f",
            departmentID: "60c72b2f9b1e8c001f5f7c70",
            status: "Pending",
            createdDate: "2024-10-01T09:00:00Z",
            closedDate: null,
            // Add other example properties as needed
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controller/*.js"], // Paths to the API docs
};

// Initialize Swagger JSDoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const customerRoutes = require("./routes/Customer");
const staffRoutes = require("./routes/Staff");
const ticketRoutes = require("./routes/Ticket");
const departmentRoutes = require("./routes/Department");
const DashboardRoutes = require("./routes/Dashboard");
const announcementsRouter = require("./routes/announcements");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/customers", customerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/Dashboard", DashboardRoutes);
app.use("/api/announcements", announcementsRouter);
app.use("/api/messages", messageRoutes);

// Root endpoint for basic information
app.get("/", (req, res) => {
  res.send("Welcome to GovDB API");
});

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log("\n###################################");
  console.log(`Server is running on port -> ${PORT}`);
  console.log("\n- API Endpoints -");
  console.log("\t-> /api/customers");
  console.log("\t-> /api/staff");
  console.log("\t-> /api/tickets");
  console.log("\t-> /api/departments");
  console.log("\t-> /api/Dashboard");
  console.log(
    `\nSwagger documentation available at https://govhub-backend.tharuksha.com/api-docs`
  );
  console.log("###################################\n");
});
