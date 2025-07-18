const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\+?[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    name: {
        type: String,
        required: function () { return this.role === 'instructor'; },
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    role: {
        type: String,
        enum: ['instructor', 'admin', 'super-admin'],
        required: true
    },

    // Custom Permissions (overrides role defaults)
    permissions: [{
        type: String
    }],

    // Feature Access Restrictions
    restrictedFeatures: [{
        featureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feature'
        },
        reason: {
            type: String
        },
        restrictedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        // Optional, for instructor profiles
    },

    profileUrl: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date
    }

});

// Update updatedAt on save
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Ensure unique indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ institutionId: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);