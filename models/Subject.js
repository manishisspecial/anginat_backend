const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution is required']
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    minlength: [3, 'Subject name must be at least 3 characters long']
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    minlength: [3, 'Subject code must be at least 3 characters long']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  degree: {
    type: Schema.Types.ObjectId,
    ref: 'Degree',
    // Optional, links subject to a degree program (e.g., BCA)
  },
  classCode: {
    type: String,
    required: [true, 'Class code is required for school subjects'],
    trim:true
  },
  credits: {
    type: Number,
    min: [0, 'Credits cannot be negative'],
    // Optional, for higher education subjects
  },
  type: {
    type: String,
    enum: {
      values: ['theory', 'lab', 'practical', 'project'],
      message: '{VALUE} is not a valid subject type'
    },
    default: 'theory'
  },
  instructors: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'instructor' && user.status === 'active';
      },
      message: 'Instructor must be an active user with role "instructor"'
    }
  }]
}, { timestamps: true });

// Ensure unique subject code per institution
SubjectSchema.index({ institution: 1, code: 1 }, { unique: true });

SubjectSchema.pre('save', async function (next) {
  try {
    // Check degree institution
    if (this.degree) {
      const Degree = mongoose.model('Degree');
      const degreeDoc = await Degree.findById(this.degree);
      if (!degreeDoc) {
        return next(new Error('Degree not found'));
      }
      if (degreeDoc.institution.toString() !== this.institution.toString()) {
        return next(new Error('Degree must belong to the same institution as Subject'));
      }
    }

    // Check each instructor's institution
    if (this.instructors && this.instructors.length > 0) {
      const User = mongoose.model('User');
      const instructors = await User.find({ _id: { $in: this.instructors } });
      if (instructors.length !== this.instructors.length) {
        return next(new Error('One or more instructors not found'));
      }
      for (const instructor of instructors) {
        if (!instructor.institutionId || instructor.institutionId.toString() !== this.institution.toString()) {
          return next(new Error('All instructors must belong to the same institution as Subject'));
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

SubjectSchema.pre('validate', async function (next) {
  try {
    const Institution = mongoose.model('Institution');
    const institutionDoc = await Institution.findById(this.institution);
    if (!institutionDoc) {
      return next(new Error('Institution not found'));
    }

    if (institutionDoc.institutionType === 'school') {
      if (!this.classCode) {
        return next(new Error('classCode is required for school subjects'));
      }
      this.degree = undefined;
      // Disallow credits for school subjects
      if (this.credits) {
        return next(new Error('Credits are not allowed for school subjects'));
      }
    } else {
      if (!this.degree) {
        return next(new Error('degree is required for college subjects'));
      }
    
      // Credits are allowed for college subjects, but not required
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);