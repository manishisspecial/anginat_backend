const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LeadSchema = new Schema({
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    course: { type: String, required: true },
    applicantName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});
module.exports = mongoose.model('Lead', LeadSchema);
