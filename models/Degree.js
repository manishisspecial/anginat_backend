const mongoose = require('mongoose');
const { Schema } = mongoose;

const DegreeSchema = new Schema({
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution is required']
    },
    name: {
        type: String,
        required: [true, 'Degree name is required'],
        trim: true,
        minlength: [3, 'Degree name must be at least 3 characters long']
    },
    shortCode: {
        type: String,
        required: [true, 'Short code is required'],
        trim: true,
        minlength: [2, 'Short code must be at least 2 characters long']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 year']
    },
    totalSemesters: {
        type: Number,
        required: [true, 'Total semesters is required'],
        min: [1, 'Total semesters must be at least 1']
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Ensure unique degree name per institution
DegreeSchema.index({ institution: 1, name: 1 }, { unique: true });

// Prevent OverwriteModelError
module.exports = mongoose.models.Degree || mongoose.model('Degree', DegreeSchema);