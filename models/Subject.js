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
            validator: async function(id) {
                const user = await mongoose.model('User').findById(id);
                return user && user.role === 'instructor' && user.status === 'active';
            },
            message: 'Instructor must be an active user with role "instructor"'
        }
    }]
}, { timestamps: true });

// Ensure unique subject code per institution
SubjectSchema.index({ institution: 1, code: 1 }, { unique: true });

// Index for degree-specific queries
SubjectSchema.index({ institution: 1, degree: 1 });

// Prevent OverwriteModelError
module.exports = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);