const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Semester = new Schema({
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution is required'],
        index: true // Index for faster queries by institution
    },
    degree:{ 
        type:Schema.Types.ObjectId,
        ref: 'Degree', 
        required: [true, 'Degree is required'],
        index: true // Index for queries by degree
    },  
    academicClass: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicClass',
        required: [true, 'Academic class is required'],
        index: true // Index for queries by academicClass
    },
    semesterNumber: {
        type: Number,
        required: [true, 'Semester number is required'],
        min: [1, 'Semester number must be at least 1'],
        max: [12, 'Semester number cannot exceed 12'], // Reasonable limit for most degree programs
        validate: {
            validator: Number.isInteger,
            message: 'Semester number must be an integer'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        validate: {
            validator: async function(subjectId) {
                const Subject = mongoose.model('Subject');
                const subject = await Subject.findById(subjectId);
                return subject && subject.institution.toString() === this.institution.toString();
            },
            message: 'Invalid subject or subject does not belong to the same institution'
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false,
        index: true // Index for filtering active semesters
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to calculate duration in days
Semester.virtual('durationDays').get(function() {
    if (this.startDate && this.endDate) {
        return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    }
    return null;
}); 

// Pre-save hook to validate dates and ensure no overlapping semesters
Semester.pre('save', async function(next) {
    try {
        // Validate startDate is before endDate
        if (this.startDate && this.endDate && this.startDate >= this.endDate) {
            return next(new Error('Start date must be before end date'));
        }

        // Check for overlapping semesters for the same academicClass
        if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
            const overlapping = await this.constructor.findOne({
                institution: this.institution,
                academicClass: this.academicClass,
                _id: { $ne: this._id }, // Exclude current document
                isDeleted: false,
                $or: [
                    {
                        startDate: { $lte: this.endDate },
                        endDate: { $gte: this.startDate }
                    }
                ]
            });

            if (overlapping) {
                return next(new Error('Semester dates overlap with an existing semester for this academic class'));
            } 

        } 

        // Validate degree, academicClass, and all courses are from the same institution
        const Degree = mongoose.model('Degree');
        const AcademicClass = mongoose.model('AcademicClass');
        const Subject = mongoose.model('Subject');

        const [degreeDoc, academicClassDoc, courseDocs] = await Promise.all([
            Degree.findById(this.degree),
            AcademicClass.findById(this.academicClass),
            this.courses && this.courses.length > 0
                ? Subject.find({ _id: { $in: this.courses } })
                : []
        ]);

        if (!degreeDoc) {
            return next(new Error('Degree not found'));
        }

        if (!academicClassDoc) {
            return next(new Error('AcademicClass not found'));
        }

        if (this.courses && this.courses.length > 0 && courseDocs.length !== this.courses.length) {
            return next(new Error('One or more subjects in courses not found'));
        }

        const institutionId = this.institution.toString();

        if (degreeDoc.institution.toString() !== institutionId) {
            return next(new Error('Degree must belong to the same institution as Semester'));
        }

        if (academicClassDoc.institution.toString() !== institutionId) {
            return next(new Error('AcademicClass must belong to the same institution as Semester'));
        }

        for (const subject of courseDocs) {
            if (subject.institution.toString() !== institutionId) {
                return next(new Error('All subjects in courses must belong to the same institution as Semester'));
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Index for efficient querying by institution and academicClass
Semester.index({ institution: 1,degree:1 , academicClass: 1, semesterNumber: 1 }, { unique: true });

// Query helper for active semesters
Semester.query.active = function() {
    return this.where({ isDeleted: false });
};

// Static method to find semesters by academicClass
Semester.statics.findByAcademicClass = async function(academicClassId) {
    return this.find({ academicClass: academicClassId, isDeleted: false })
        .populate('institution academicClass courses')
        .sort({ semesterNumber: 1 });
};

module.exports = mongoose.model('Semester', Semester);