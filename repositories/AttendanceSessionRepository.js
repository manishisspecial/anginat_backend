const AttendanceSession = require("../models/AttendanceSession");

class AttendanceSessionRepository {
  async createAttendanceSession(sessionData) {
    return AttendanceSession.create(sessionData);
  }

  async findByDateSubjectSection(date, subjectId, sectionId) {
    return AttendanceSession.findOne({
      date: date,
      subject: subjectId,
      section: sectionId,
    })
      .populate("instructor", "name email")
      .populate("academicClass", "name")
      .populate("section", "name")
      .populate("subject", "name");
  } 

  async findBySubjectAndSection(subjectId, sectionId) {
    return AttendanceSession.find({ subject: subjectId, section: sectionId })
      .populate("instructor", "name email")
      .populate("academicClass", "name")
      .populate("section", "name")
      .populate("subject", "name")
      .populate("attendanceRecords", "status student");
  }

  async updateAttendanceSession(sessionId, sessionData) {
    return AttendanceSession.findOneAndUpdate({ _id: sessionId }, sessionData, {
      new: true,
    })
      .populate("instructor", "name email")
      .populate("academicClass", "name")
      .populate("section", "name")
      .populate("subject", "name")
      .populate("attendanceRecords", "status student");
  }

  async findAttendanceSessions(filters = {}) {
    // Remove undefined filters so they don't affect the query
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    return AttendanceSession.find(filters)
      .populate("instructor", "name email")
      .populate("academicClass", "name")
      .populate("section", "name")
      .populate("subject", "name")
      .populate("attendanceRecords", "status student");
  }
}


module.exports = new AttendanceSessionRepository();



