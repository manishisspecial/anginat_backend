const Semester = require("../models/Semester");

class SemesterRepository {
    async create(data) {
        const semester = new Semester(data);
        return semester.save();
    }

    async findById(id) {
        return Semester.findOne({ _id: id, isDeleted: false })
            .populate("institution academicClass courses degree")
            .exec();
    }

    async find(query, skip = 0, limit = 10) {
        return Semester.find(query)
            .active()
            .skip(skip)
            .limit(limit)
            .populate("institution academicClass courses degree")
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
            .populate("institution academicClass courses degree")
            .exec();
    }
}

module.exports = new SemesterRepository();
