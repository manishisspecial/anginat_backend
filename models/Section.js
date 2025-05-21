const mongoose = require('mongoose');
const { Schema } = mongoose;

const SectionSchema = new Schema({
  academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  name:         { type: String, required: true },
  description:  { type: String },
}, { timestamps: true });

SectionSchema.index({ academicClass: 1, name: 1 }, { unique: true });
module.exports = mongoose.models.Section || mongoose.model('Section', SectionSchema);