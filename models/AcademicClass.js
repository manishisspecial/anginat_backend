const mongoose = require("mongoose");
const { Schema } = mongoose;

const AcademicClassSchema = new Schema(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution is required"],
    },
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      minlength: [2, "Class name must be at least 2 characters long"],
    },    
    classCode: {
      type: String,
      required: [true, "Class code is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      validate: {
        validator: function (v) {
          // Matches 4 digits, a dash, then 2 digits (e.g., 2024-25)
          return /^\d{4}-\d{2}$/.test(v);
        },
        message: props => `${props.value} is not a valid academic year format (expected: YYYY-YY)`
      }
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      // Not required, as degree-based classes may not need a level
    },
    degree: {
      type: Schema.Types.ObjectId,
      ref: "Degree",
      // Optional, for degree-based classes like BCA Year 1
    },
    startTime:{
      type: String,
      required: [true, "Start time is required"],
      validate: {
        validator: function (v) {
          // Matches HH:MM format
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (expected: HH:MM)`
      }
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (v) {
          // Matches HH:MM format
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (expected: HH:MM)`
      }
    },
  },
  { timestamps: true }
);

// Ensure unique class name per institution, considering level or degree
AcademicClassSchema.index(
  { institution: 1, classCode: 1, level: 1, degree: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [{ level: { $exists: true } }, { degree: { $exists: true } }],
    },
  }
);

// Validate degree existence and institution match before saving
AcademicClassSchema.pre('save', async function (next) {
  try {
    if (this.degree) {
      const Degree = mongoose.model('Degree');
      const degreeDoc = await Degree.findById(this.degree);
      if (!degreeDoc) {
        return next(new Error('Degree not found'));
      }
      if (degreeDoc.institution.toString() !== this.institution.toString()) {
        return next(new Error('Degree must belong to the same institution as AcademicClass'));
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Prevent OverwriteModelError
module.exports =
  mongoose.models.AcademicClass ||
  mongoose.model("AcademicClass", AcademicClassSchema);
