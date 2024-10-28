const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    institutionType: { type: String, enum: ['school', 'institute'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    domainName: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', institutionSchema);
