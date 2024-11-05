const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    institutionType: { type: String, enum: ['school', 'institute'], required: true },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    address: {
        type: String,
        required: true
    },
    domainName: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[a-z0-9]+([-._][a-z0-9]+)*\.[a-z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid domain name!`
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Institution', institutionSchema);
