const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
       
    },
    departmentDescription: {
        type: String,
       
    },
    phoneNumber: {
        type: String,
       
    },
    emailAddress: {
        type: String,
       
    },
    departmentHeadID: {
        type: String,
    },
    operatingHours: {
        type: String,
       
    }
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = { Department };
