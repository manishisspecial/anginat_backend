const mongoose = require("mongoose");
const { Schema } = mongoose;

const SectionSchema = new Schema(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution is required"],
    },
    academicClass: {
      type: Schema.Types.ObjectId,
      ref: "AcademicClass",
      required: true,
    },
    name: { type: String, required: true },
    section: { type: String, required: true },
    description: { type: String },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ]
  },
  { timestamps: true }
); 

SectionSchema.index({ academicClass: 1, section: 1, name : 1 }, { unique: true });

SectionSchema.pre('save', async function (next) {
  try {
    const AcademicClass = mongoose.model('AcademicClass');
    const Subject = mongoose.model('Subject');
    const Institution = mongoose.model('Institution');

    // Fetch institution to check its type
    const institutionDoc = await Institution.findById(this.institution);
    if (!institutionDoc) {
      return next(new Error('Institution not found'));
    }

    // If not school, subjects array must be empty or undefined
    if (institutionDoc.institutionType !== 'school') {
      if (this.subjects && this.subjects.length > 0) {
        return next(new Error('Subjects can only be assigned to sections of school institutions'));
      }
      // Optionally, clear subjects array if present
      this.subjects = [];
    }

    const academicClassDoc = await AcademicClass.findById(this.academicClass);
    if (!academicClassDoc) {
      return next(new Error('AcademicClass not found'));
    }
    if (academicClassDoc.institution.toString() !== this.institution.toString()) {
      return next(new Error('AcademicClass must belong to the same institution as Section'));
    }

    // Only check subjects if institutionType is school
    if (institutionDoc.institutionType === 'school' && this.subjects && this.subjects.length > 0) {
      const subjects = await Subject.find({ _id: { $in: this.subjects } });
      const invalidSubject = subjects.find(
        (subj) => subj.institution.toString() !== this.institution.toString()
      );
      if (invalidSubject) {
        return next(new Error('All subjects must belong to the same institution as Section'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.Section || mongoose.model("Section", SectionSchema);