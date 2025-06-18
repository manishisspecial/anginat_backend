const { default: mongoose } = require("mongoose");
const {
  attendanceSessionSchema,
} = require("../validations/AttendanceValidation");
const AttendanceSessionService = require("../services/AttendanceSessionService");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

class AttendanceSessionController {

  async createAttendanceSession(req, res) {
    
    try {
      const sessionData = req.body;
      const { institution } = req.user;
      sessionData.date = new Date(sessionData.date);

      // Validate sessionData
      const { error } = attendanceSessionSchema.validate(sessionData);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Validate ObjectIds 
      const requiredIds = [
        { key: "timetable", value: sessionData.timetable },
        { key: "instructor", value: sessionData.instructor },
        { key: "academicClass", value: sessionData.academicClass },
        { key: "section", value: sessionData.section },
        { key: "subject", value: sessionData.subject },
      ];
      for (const { key, value } of requiredIds) {
        if (!value || !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error(`Invalid ${key} ID`);
        }
      }

      const newSession = await AttendanceSessionService.createAttendanceSession(
        {
          institution,
          ...sessionData,
        }
      );
      return sendSuccessResponse(
        res,
        "Attendance session created successfully.",
        newSession
      );
    } catch (error) {
      console.error("Error creating attendance session:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getAttendanceSessions(req, res) {
    try {
      const { role, id: userId } = req.user;
      const filters = {};

      // Validate and add filters only if IDs are valid
      const idFilters = [
        { key: "subjectId", field: "subject" },
        { key: "sectionId", field: "section" },
        { key: "semesterId", field: "semester" },
        { key: "academicClassId", field: "academicClass" },
      ];

      for (const { key, field } of idFilters) {
        if (req.query[key]) {
          if (!mongoose.Types.ObjectId.isValid(req.query[key])) {
            return sendErrorResponse(res, `Invalid ${key} provided.`, 400);
          }
          filters[field] = req.query[key];
        }
      }

      if (req.query.date) filters.date = new Date(req.query.date);
      if (role === "instructor") filters.instructor = userId;

      const sessions = await AttendanceSessionService.getAttendanceSessions(filters);

      if (role === "instructor") {
        const isAssigned = sessions.some(
          (s) => s.instructor._id.toString() === userId.toString()
        );
        if (!isAssigned) {
          return sendErrorResponse(
            res,
            403,
            "You do not have access to attendance sessions for the specified filters."
          );
        }
        const filtered = sessions.filter(
          (s) => s.instructor._id.toString() === userId.toString()
        );
        if (filtered.length === 0) {
          return sendSuccessResponse(
            res,
            "You are assigned to the specified filters, but no attendance sessions have been created yet.",
            []
          );
        }
        return sendSuccessResponse(
          res,
          "Attendance sessions matching your filters retrieved successfully.",
          filtered
        );
      }

      // Admin or other roles
      if (!sessions || sessions.length === 0) {
        return sendSuccessResponse(
          res,
          "No attendance sessions found for the specified filters.",
          []
        );
      }
      return sendSuccessResponse(
        res,
        "Attendance sessions matching your filters retrieved successfully.",
        sessions
      );
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AttendanceSessionController();
