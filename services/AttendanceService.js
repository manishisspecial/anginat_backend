const AttendanceRepository = require("../repositories/AttendanceRepository");

class AttendanceService{
    async createMany(attendanceArray) {
        return AttendanceRepository.createMany(attendanceArray);
    }
}

module.exports = new AttendanceService();