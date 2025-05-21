const Semester = require('../models/Semester');

class SemesterRepository {
    async create(data) {
        const semester = new Semester(data);
        return semester.save();
    }

    async findById(id) {
        return Semester.findOne({ _id: id, isDeleted: false })
            .populate('institution academicClass courses')
            .exec();
    }

    async find(query) {
        return Semester.find(query)
            .active()
            .populate('institution academicClass courses')
            .exec();
    }

    async countDocuments(query) {
        return Semester.countDocuments({ ...query, isDeleted: false }).exec();
    }

    async update(id, data) {
        return Semester.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: data },
            { new: true, runValidators: true }
        )
            .populate('institution academicClass courses')
            .exec();
    }
}

module.exports = new SemesterRepository();