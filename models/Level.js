const mongoose = require('mongoose');
const { Schema } = mongoose; // ✅You must add this line

const LevelSchema = new Schema({
  institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  levelNumber: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['nursery', 'primary', 'upper_primary', 'secondary', 'higher_secondary', 'tertiary', 'vocational'], required: true },
  description: { type: String },
}, { timestamps: true });

LevelSchema.index({ institution: 1, category: 1, levelNumber: 1 }, { unique: true });

module.exports = mongoose.model("Level", LevelSchema);

