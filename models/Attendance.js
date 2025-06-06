const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
  session: {
    type: Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
    required: true
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, { timestamps: true });

AttendanceSchema.index({ session: 1, student: 1 }, { unique: true });
AttendanceSchema.index({ session: 1 });
AttendanceSchema.index({ student: 1 });

AttendanceSchema.pre('save', async function (next) {
  try {
    const AttendanceSession = mongoose.model('AttendanceSession');
    const Student = mongoose.model('Student');

    const [sessionDoc, studentDoc] = await Promise.all([
      AttendanceSession.findById(this.session),
      Student.findById(this.student)
    ]);

    if (!sessionDoc) {
      return next(new Error('AttendanceSession not found'));
    }
    if (!studentDoc) {
      return next(new Error('Student not found'));
    }

    // If both have institution field, check they match
    if (
      sessionDoc.institution &&
      studentDoc.institution &&
      sessionDoc.institution.toString() !== studentDoc.institution.toString()
    ) {
      return next(new Error('Student and AttendanceSession must belong to the same institution'));
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
