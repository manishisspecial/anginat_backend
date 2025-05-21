const DegreeRepository = require("../repositories/DegreeRepository");
const mongoose = require('mongoose');

class DegreeService {
    async createDegree(degreeData) {
        const { name, shortCode, duration, totalSemesters, institution } = degreeData;
        if (!name || !shortCode || !duration || !totalSemesters || !institution) {
            throw new Error("Name, shortCode, duration, totalSemesters, and institution are required");
        }
        return DegreeRepository.createDegree(degreeData);
    }

    async getDegreeById(degreeId, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(degreeId)) {
            throw new Error("Invalid degree ID");
        }
        const degree = await DegreeRepository.getDegreeById(degreeId, institutionId);
        if (!degree) {
            throw new Error("Degree not found or does not belong to your institution");
        }
        return degree;
    }

    async getAllDegrees(institutionId) {
        return DegreeRepository.getAllDegrees(institutionId);
    }

    async updateDegree(degreeId, degreeData, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(degreeId)) {
            throw new Error("Invalid degree ID");
        }
        const degree = await DegreeRepository.updateDegree(degreeId, degreeData, institutionId);
        if (!degree) {
            throw new Error("Degree not found or does not belong to your institution");
        }
        return degree;
    }

    async deleteDegree(degreeId, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(degreeId)) {
            throw new Error("Invalid degree ID");
        }
        const degree = await DegreeRepository.deleteDegree(degreeId, institutionId);
        if (!degree) {
            throw new Error("Degree not found or does not belong to your institution");
        }
        return degree;
    }
}

module.exports = new DegreeService();