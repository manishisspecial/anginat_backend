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
  },
  { timestamps: true }
); 

SectionSchema.index({ academicClass: 1, section: 1, name : 1 }, { unique: true });

SectionSchema.pre('save', async function (next) {
  try {
    const AcademicClass = mongoose.model('AcademicClass');
    const academicClassDoc = await AcademicClass.findById(this.academicClass);
    if (!academicClassDoc) {
      return next(new Error('AcademicClass not found'));
    }
    if (academicClassDoc.institution.toString() !== this.institution.toString()) {
      return next(new Error('AcademicClass must belong to the same institution as Section'));
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.Section || mongoose.model("Section", SectionSchema);