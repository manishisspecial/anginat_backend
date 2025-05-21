const SubjectRepository = require("../repositories/SubjectRepository");
const DegreeRepository = require("../repositories/DegreeRepository");
const User = require("../models/User");
const mongoose = require('mongoose');

class SubjectService {
    async createSubject(subjectData) {
        const { name, code, institution, degree, instructors } = subjectData;
        if (!name || !code || !institution || !instructors) {
            throw new Error("Name, code, institution, and instructors are required");
        }
        if (!mongoose.Types.ObjectId.isValid(institution)) {
            throw new Error("Invalid institution ID");
        }
        if (degree && !mongoose.Types.ObjectId.isValid(degree)) {
            throw new Error("Invalid degree ID");
        }
        if (instructors.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            throw new Error("Invalid instructor ID(s)");
        }
        // Validate instructors
        const users = await User.find({ _id: { $in: instructors } });
        if (users.length !== instructors.length || users.some(u => u.role !== 'instructor' || u.status !== 'active')) {
            throw new Error("All instructors must be active users with role 'instructor'");
        }
        if (degree) {
            const degreeExists = await DegreeRepository.getDegreeById(degree, institution);
            if (!degreeExists) {
                throw new Error("Degree not found or does not belong to your institution");
            }
        }
        return SubjectRepository.createSubject(subjectData);
    }

    async getSubjectById(subjectId, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            throw new Error("Invalid subject ID");
        }
        const subject = await SubjectRepository.getSubjectById(subjectId, institutionId);
        if (!subject) {
            throw new Error("Subject not found or does not belong to your institution");
        }
        return subject;
    }

    async getAllSubjects(institutionId) {
        return SubjectRepository.getAllSubjects(institutionId);
    }

    async updateSubject(subjectId, subjectData, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            throw new Error("Invalid subject ID");
        }
        const { degree, instructors } = subjectData;
        if (degree && !mongoose.Types.ObjectId.isValid(degree)) {
            throw new Error("Invalid degree ID");
        }
        if (instructors && instructors.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            throw new Error("Invalid instructor ID(s)");
        }
        if (instructors) {
            const users = await User.find({ _id: { $in: instructors } });
            if (users.length !== instructors.length || users.some(u => u.role !== 'instructor' || u.status !== 'active')) {
                throw new Error("All instructors must be active users with role 'instructor'");
            }
        }
        if (degree) {
            const degreeExists = await DegreeRepository.getDegreeById(degree, institutionId);
            if (!degreeExists) {
                throw new Error("Degree not found or does not belong to your institution");
            }
        }
        const updatedSubject = await SubjectRepository.updateSubject(subjectId, subjectData, institutionId);
        if (!updatedSubject) {
            throw new Error("Subject not found or does not belong to your institution");
        }
        return updatedSubject;
    }

    async deleteSubject(subjectId, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            throw new Error("Invalid subject ID");
        }
        const deletedSubject = await SubjectRepository.deleteSubject(subjectId, institutionId);
        if (!deletedSubject) {
            throw new Error("Subject not found or does not belong to your institution");
        }
        return deletedSubject;
    }
}

module.exports = new SubjectService();