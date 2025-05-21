const mongoose = require('mongoose');
const { Schema } = mongoose;

const AcademicClassSchema = new Schema({
  institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  name:        { type: String, required: true },
  level:       { type: Schema.Types.ObjectId, ref: 'Level', required: true },
}, { timestamps: true });

module.exports = mongoose.model('AcademicClass', AcademicClassSchema);