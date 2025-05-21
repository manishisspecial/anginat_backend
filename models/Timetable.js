const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimetableSchema = new Schema({
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution is required']
    },
    academicClass: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicClass',
        required: [true, 'AcademicClass is required']
    },
    section: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: [true, 'Section is required']
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required']
    },
    degree: {
        type: Schema.Types.ObjectId,
        ref: 'Degree',
        // Optional, for degree-specific timetables
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: [1, 'Semester must be at least 1'],
        max: [8, 'Semester cannot exceed 8']
    },
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Instructor is required'],
        validate: {
            validator: async function(id) {
                const user = await mongoose.model('User').findById(id);
                return user && user.role === 'instructor' && user.status === 'active';
            },
            message: 'Instructor must be an active user with role "instructor"'
        }
    },
    weeklyHours: {
        type: Number,
        required: [true, 'Weekly hours is required'],
        min: [1, 'Weekly hours must be at least 1'],
        max: [20, 'Weekly hours cannot exceed 20']
    },
    scheduleDetails: [{
        day: {
            type: String,
            enum: {
                values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                message: '{VALUE} is not a valid day'
            },
            required: [true, 'Day is required']
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
        },
        room: {
            type: String,
            trim: true,
            maxlength: [50, 'Room cannot exceed 50 characters']
        }
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot exceed 200 characters']
    }
}, { timestamps: true });

// Index for common queries
TimetableSchema.index({ institution: 1, academicClass: 1, semester: 1 });
TimetableSchema.index({ institution: 1, section: 1, semester: 1 });
TimetableSchema.index({ institution: 1, instructor: 1, semester: 1 });

// Prevent OverwriteModelError
module.exports = mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);