const Attendance = require("../models/Attendance");

class AttendanceRepository {
  async createMany(attendanceArray) {
    return Attendance.insertMany(attendanceArray);
  }

  async findBySessionId(sessionId) {
    return Attendance.find({ session: sessionId })
      .populate("student", "name email")
      .populate("session", "date subject section");
  }

  async update(attendanceId, status) {
    return Attendance.findOneAndUpdate({ _id: attendanceId }, { status }, {
      new: true,
    })
      .populate("student", "name email")
      .populate("session", "date subject section");
  }
} 

module.exports = new AttendanceRepository();
