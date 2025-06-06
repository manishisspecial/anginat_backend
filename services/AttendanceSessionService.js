const AttendanceSessionRepository = require("../repositories/AttendanceSessionRepository");

class AttendanceSessionService {
    async createAttendanceSession(sessionData) {
        try {
            return await AttendanceSessionRepository.createAttendanceSession(sessionData);  
        } catch (error) {
            throw new Error(`Error creating attendance session: ${error.message}`);
        }
    }

    // Accepts a filters object for flexible querying
    async getAttendanceSessions(filters = {}) {
        try {
            return await AttendanceSessionRepository.findAttendanceSessions(filters);
        } catch (error) {
            throw new Error(`Error fetching attendance sessions: ${error.message}`);
        }
    }

    async updateAttendanceSession(sessionId, sessionData) {
        try {
            return await AttendanceSessionRepository.updateAttendanceSession(sessionId, sessionData);
        } catch (error) {
            throw new Error(`Error updating attendance session: ${error.message}`);
        }
    }
}

module.exports = new AttendanceSessionService();