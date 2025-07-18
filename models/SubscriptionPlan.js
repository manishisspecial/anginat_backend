// models/SubscriptionPlan.js
const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  // Basic Plan Information
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['free', 'pro', 'enterprise', 'trial']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  
  // Pricing Information
  pricing: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  
  // Resource Limits
  limits: {
    maxStudents: { type: Number, default: null }, // null = unlimited
    maxTeachers: { type: Number, default: null },
    maxClasses: { type: Number, default: null },
    maxSubjects: { type: Number, default: null },
    storageGB: { type: Number, default: 1 }, // Storage in GB
    maxAnnouncements: { type: Number, default: null },
    maxMediaFiles: { type: Number, default: null }
  },
  
  // Feature Access Configuration
  features: [{
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feature',
      required: true
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null // null = unlimited within plan limits
    },
    resetCycle: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'never'],
      default: 'monthly'
    }
  }],
  
  // Plan Status
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
subscriptionPlanSchema.index({ name: 1, isActive: 1 });
subscriptionPlanSchema.index({ 'features.featureId': 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);