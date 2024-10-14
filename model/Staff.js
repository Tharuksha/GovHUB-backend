const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    firstName: {
        type: String,
       
    },
    lastName: {
        type: String,
       
    },
    dateOfBirth: {
        type: Date,
       
    },
    gender: {
        type: String,
       
    },
    phoneNumber: {
        type: String,
       
    },
    emailAddress: {
        type: String,
       
    },
    address: {
        type: String,
       
    },
    employeeID: {
        type: String,
       
    },
    departmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
       
    },
    password: {
        type: String,
       
    },
    role: {
        type: String,
        default: 'staff',
       
    },
    hireDate: {
        type: Date,
       
    },
    permission: {
        type: String,
       
    }
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = { Staff };
