// models/Feature.js
const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  // Feature Identity
  name: {
    type: String,
    required: true,
    unique: true // e.g., 'academic_management', 'timetable_management'
  },
  displayName: {
    type: String,
    required: true // e.g., 'Academic Management', 'Timetable Management'
  },
  description: {
    type: String
  },

  // Feature Organization
  module: {
    type: String,
    required: true,
    enum: [
      'academic', "courses", 'attendance', 'timetable', 'leads',
      'media', 'announcements', 'reports', 'settings',
      'communication', 'finance', 'study_materials', 'exams', "chat"
    ]
  },

  // Which institute types commonly use this feature
  commonForTypes: [{
    type: String,
    enum: ['school', 'college', 'online_institute']
  }],

  category: {
    type: String,
    enum: ['core', 'advanced', 'premium', 'addon'],
    default: 'core'
  },

  // Access Control
  requiredPermissions: [{
    type: String,
    required: true // e.g., 'read_students', 'create_classes'
  }],

  // Feature Configuration
  isCore: {
    type: Boolean,
    default: false // Core features are always available
  },

  isToggleable: {
    type: Boolean,
    default: true // Can be enabled/disabled
  },


  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
featureSchema.index({ module: 1, isCore: 1 });
featureSchema.index({ name: 1 });

module.exports = mongoose.model('Feature', featureSchema);