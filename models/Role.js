const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        trim: true,
        minlength: [2, 'Role name must be at least 2 characters'],
        maxlength: [50, 'Role name cannot exceed 50 characters']
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

roleSchema.index({ institutionId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
