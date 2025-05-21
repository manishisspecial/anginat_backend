const Timetable = require("../models/Timetable");

class TimetableRepository {
    async createTimetable(timetableData) {
        return Timetable.create(timetableData);
    }

    async getTimetableById(timetableId, institutionId) {
        return Timetable.findOne({
            _id: timetableId,
            institution: institutionId
        })
            .populate('institution', 'name')
            .populate('academicClass', 'name')
            .populate('section', 'name')
            .populate('subject', 'name code')
            .populate('degree', 'name shortCode')
            .populate('instructor', 'name email role');
    }

    async getAllTimetables(institutionId) {
        return Timetable.find({ institution: institutionId })
            .populate('institution', 'name')
            .populate('academicClass', 'name')
            .populate('section', 'name')
            .populate('subject', 'name code')
            .populate('degree', 'name shortCode')
            .populate('instructor', 'name email role');
    }

    async updateTimetable(timetableId, timetableData, institutionId) {
        return Timetable.findOneAndUpdate(
            { _id: timetableId, institution: institutionId },
            timetableData,
            { new: true }
        )
            .populate('institution', 'name')
            .populate('academicClass', 'name')
            .populate('section', 'name')
            .populate('subject', 'name code')
            .populate('degree', 'name shortCode')
            .populate('instructor', 'name email role');
    }

    async deleteTimetable(timetableId, institutionId) {
        return Timetable.findOneAndDelete({
            _id: timetableId,
            institution: institutionId
        });
    }
}

module.exports = new TimetableRepository();