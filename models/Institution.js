const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    institutionType: { type: String, enum: ['school', 'institute', 'college'], required: true },
    institutionCode: {
        type: String,
        required: true,
        unique: true,
    },
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
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    domainName: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-z0-9]+([-._][a-z0-9]+)*\.[a-z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid domain name!`
        }
    },
    profileUrl: {
        type: String
    },
    coverUrl: {
        type: String
    },
    logoUrl: {
        type: String
    },


    // Feature Access Mode
    featureAccessMode: {
        type: String,
        enum: ['subscription', 'custom', 'hybrid'],
        default: 'subscription',
        index: true
        // subscription: Uses subscription plan features
        // custom: Uses only custom features (ignores subscription)
        // hybrid: Uses both subscription + custom overrides
    },


    // Subscription Information
    subscription: {
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'expired', 'suspended'],
            default: 'active'
        },
        trialEndsAt: {
            type: Date
        },
        startsAt: {
            type: Date,
            required: function () {
                return this.subscription && this.subscription.planId;
            }
        },
        endsAt: {
            type: Date
        },
        autoRenew: {
            type: Boolean,
            default: true
        }
    },

    // Current Usage Tracking
    usage: {
        students: { type: Number, default: 0 },
        teachers: { type: Number, default: 0 },
        classes: { type: Number, default: 0 },
        subjects: { type: Number, default: 0 },
        storageUsedGB: { type: Number, default: 0 },
        announcements: { type: Number, default: 0 },
        mediaFiles: { type: Number, default: 0 }
    },

    // Custom Resource Limits (overrides subscription limits)
    customLimits: {
        maxStudents: { type: Number, default: null },
        maxTeachers: { type: Number, default: null },
        maxClasses: { type: Number, default: null },
        maxSubjects: { type: Number, default: null },
        storageGB: { type: Number, default: null },
        maxAnnouncements: { type: Number, default: null },
        maxMediaFiles: { type: Number, default: null },
        // Override flags
        useCustomLimits: { type: Boolean, default: false }
    },

    // Feature-specific Usage
    featureUsage: [{
        featureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feature',
            required: true
        },
        usageCount: {
            type: Number,
            default: 0
        },
        lastUsedAt: {
            type: Date,
            default: Date.now
        },
        resetAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Custom Feature Configuration
    customFeatures: [{
        featureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feature',
            required: true
        },
        isEnabled: {
            type: Boolean,
            default: true
        },
        customLimit: {
            type: Number,
            default: null // null = unlimited
        },
        resetCycle: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly', 'never'],
            default: 'never'
        },
        reason: {
            type: String // Why this feature was added/modified
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Admin who added this feature
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    isActive: {
        type: Boolean,
        default: true // Institution can be deactivated
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
// Indexes for performance
institutionSchema.index({ email: 1 });
institutionSchema.index({ institutionType: 1, isActive: 1 });
institutionSchema.index({ 'subscription.planId': 1, 'subscription.status': 1 });
institutionSchema.index({ 'customFeatures.featureId': 1 });
institutionSchema.index({ 'featureUsage.featureId': 1 });
institutionSchema.index({ featureAccessMode: 1, isActive: 1 });



// Virtual for full address
institutionSchema.virtual('fullAddress').get(function () {
    if (!this.address) return '';
    const parts = [
        this.address.street,
        this.address.city,
        this.address.state,
        this.address.country,
        this.address.zipCode
    ].filter(Boolean);
    return parts.join(', ');
});

// Pre-save middleware
institutionSchema.pre('save', function (next) {
    // Set trial end date if not set for trial status
    if (this.subscription &&
        this.subscription.status === 'trial' &&
        !this.subscription.trialEndsAt) {
        this.subscription.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
    next();
});


module.exports = mongoose.model('Institution', institutionSchema);