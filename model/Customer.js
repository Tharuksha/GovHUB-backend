const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    NIC: { type: String, },
    firstName: { type: String, },
    lastName: { type: String, },
    dateOfBirth: { type: Date, },
    gender: { type: String, },
    phoneNumber: { type: String, },
    emailAddress: { type: String, unique: true },
    address: { type: String, },
    password: { type: String, },
    registeredDate: { type: Date, default: Date.now }
});
 
const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };
