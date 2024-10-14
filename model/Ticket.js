const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',

    },
    staffID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
    },
    departmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',

    },
    issueDescription: {
        type: String,

    },
    status: {
        type: String,

    },
    createdDate: {
        type: Date,
        default: Date.now,

    },
    appointmentDate: {
        type: Date,
    },
    closedDate: {
        type: Date
    },
    notes: {
        type: String
    },
    feedback: {
        type: String
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { Ticket };
