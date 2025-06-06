const AttendanceService = require("../services/AttendanceService");
const AttendanceSessionService = require("../services/AttendanceSessionService");
const { sendErrorResponse, sendSuccessResponse } = require("../utils/response");
const {
  attendanceArraySchema,
} = require("../validations/AttendanceValidation");
const mongoose = require("mongoose");

class AttendanceController {
  async markAttendance(req, res) {
    try {
      const { session, attendance } = req.body;

      if (!session || !mongoose.Types.ObjectId.isValid(session)) {
        return sendErrorResponse(res, "Invalid or missing session ID.", 400);
      }

      if (!Array.isArray(attendance) || attendance.length === 0) {
        return sendErrorResponse(res, "Attendance array is required.", 400);
      }

      // Add session to each attendance record
      const attendanceArray = attendance.map((record) => ({
        ...record,
        session,
      }));

      // Validate array
      const { error } = attendanceArraySchema.validate(attendanceArray);
      if (error) {
        return sendErrorResponse(res, error.details[0].message, 400);
      }

      // Validate ObjectIds
      for (const record of attendanceArray) {
        if (!mongoose.Types.ObjectId.isValid(record.student)) {
          return sendErrorResponse(res, "Invalid student ID provided.", 400);
        }
      }

      const result = await AttendanceService.createMany(attendanceArray);

      const markedAttendance = await AttendanceSessionService.updateAttendanceSession(session, {
        isSubmitted: true,
      });

      return sendSuccessResponse(
        res,
        "Attendance marked successfully.",
        markedAttendance
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
      return sendErrorResponse(res, "Failed to mark attendance.", 500);
    }
  }
}

module.exports = new AttendanceController();
