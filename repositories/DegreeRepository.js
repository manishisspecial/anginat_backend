const Degree = require("../models/Degree");

class DegreeRepository {
    async createDegree(degreeData) {
        return Degree.create(degreeData);
    }

    async getDegreeById(degreeId, institutionId) {
        return Degree.findOne({
            _id: degreeId,
            institution: institutionId
        });
    }

    async getAllDegrees(institutionId) {
        return Degree.find({ institution: institutionId });
    }

    async updateDegree(degreeId, degreeData, institutionId) {
        return Degree.findOneAndUpdate(
            { _id: degreeId, institution: institutionId },
            degreeData,
            { new: true }
        );
    }

    async deleteDegree(degreeId, institutionId) {
        return Degree.findOneAndDelete({
            _id: degreeId,
            institution: institutionId
        });
    }
}

module.exports = new DegreeRepository();