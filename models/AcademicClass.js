const mongoose = require('mongoose');
const { Schema } = mongoose;

const AcademicClassSchema = new Schema({
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution is required']
  },
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    minlength: [2, 'Class name must be at least 2 characters long']
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'Level'
    // Not required, as degree-based classes may not need a level
  },
  degree: {
    type: Schema.Types.ObjectId,
    ref: 'Degree'
    // Optional, for degree-based classes like BCA Year 1
  }
}, { timestamps: true });

// Ensure unique class name per institution, considering level or degree
AcademicClassSchema.index(
    { institution: 1, name: 1, level: 1, degree: 1 },
    {
      unique: true,
      partialFilterExpression: {
        $or: [
          { level: { $exists: true } },
          { degree: { $exists: true } }
        ]
      }
    }
);

// Prevent OverwriteModelError
module.exports = mongoose.models.AcademicClass || mongoose.model('AcademicClass', AcademicClassSchema);