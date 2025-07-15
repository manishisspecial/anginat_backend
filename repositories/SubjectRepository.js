const Subject = require("../models/Subject");

class SubjectRepository {
    async createSubject(subjectData) {
        return Subject.create(subjectData);
    }

    async getSubjectById(subjectId, institutionId) {
        return Subject.findOne({
            _id: subjectId,
            institution: institutionId
        })
            .populate('institution', 'name')
            .populate('degree', 'name shortCode')
            .populate('instructors', 'name email role');
    }

    async getAllSubjects(institutionId) {
        return Subject.find({ institution: institutionId })
            .populate('institution', 'name')
            .populate('degree', 'name shortCode')
            .populate('instructors', 'name email role');
    }

    async findByCode(code, institutionId) {
        return Subject.findOne({ code, institution: institutionId });
    }

    async updateSubject(subjectId, subjectData, institutionId) {
        return Subject.findOneAndUpdate(
            { _id: subjectId, institution: institutionId },
            subjectData,
            { new: true }
        )
            .populate('institution', 'name')
            .populate('degree', 'name shortCode')
            .populate('instructors', 'name email role');
    }

    async deleteSubject(subjectId, institutionId) {
        return Subject.findOneAndDelete({
            _id: subjectId,
            institution: institutionId
        });
    }
}

module.exports = new SubjectRepository();