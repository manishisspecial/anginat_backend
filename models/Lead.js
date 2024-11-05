const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LeadSchema = new Schema({
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution is required'],
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        minlength: [3, 'Course name must be at least 3 characters long'],
        maxlength: [100, 'Course name must be less than 100 characters'],
    },
    applicantName: {
        type: String,
        required: [true, 'Applicant name is required'],
        minlength: [3, 'Applicant name must be at least 3 characters long'],
        maxlength: [100, 'Applicant name must be less than 100 characters'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Approved', 'Rejected'],
            message: 'Status must be either Pending, Approved, or Rejected',
        },
        default: 'Pending',
    },
});

module.exports = mongoose.model('Lead', LeadSchema);
