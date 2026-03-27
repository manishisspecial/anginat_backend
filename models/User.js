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
        enum: ['admin', 'instructor', 'student', 'super-admin'],
        required: true
    },

    // Custom Permissions (overrides role defaults)
    permissions: [{
        type: String
    }],

    allowedFeatures: [{
        featureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feature',
            required: true
        },
        // Specific permissions within this feature
        permissions: [{
            type: String,
            required: true
        }],
        // Custom limits for this user on this feature
        customLimit: {
            type: Number,
            default: null
        },
        // Why this access was granted
        reason: {
            type: String,
            default: 'Role-based access'
        },
        // Who granted this access
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Additional Custom Permissions (beyond role defaults)
    customPermissions: [{
        permission: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    isActive: {
        type: Boolean,
        default: true
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
    coverUrl: {
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
    },
    lockedUntil: {
        type: Date
    },
    passwordChangeAt:{
        type: Date,
        default: Date.now
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who created this user
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who last modified this user
    }

},{
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password; // Don't expose password
            return ret; 
        }
    }
});

// Update updatedAt on save
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

//indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ institutionId: 1, role: 1 });
userSchema.index({ institutionId: 1, isActive: 1 });
userSchema.index({ 'allowedFeatures.featureId': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name;
});


module.exports = mongoose.model('User', userSchema);