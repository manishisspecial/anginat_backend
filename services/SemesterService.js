const SemesterRepository = require('../repositories/SemesterRepository');
const AcademicClassRepository = require('../repositories/AcademicClassRepository');
const mongoose = require('mongoose');

class SemesterService {
    async createSemester(data) {
        // Validate academicClass exists and belongs to the institution
        const academicClass = await AcademicClassRepository.findById(data.academicClass);
        if (!academicClass || academicClass.institution.toString() !== data.institution.toString()) {
            const error = new Error('Invalid or unauthorized academic class');
            error.status = 400;
            throw error;
        }

        // Create semester
        return SemesterRepository.create(data);
    }

    async getSemesterById(id, institutionId) {
        const semester = await SemesterRepository.findById(id);
        if (!semester || semester.institution.toString() !== institutionId) {
            const error = new Error('Semester not found or unauthorized');
            error.status = 404;
            throw error;
        }
        return semester;
    }

    async getAllSemesters({ page, limit, filters }) {
        const skip = (page - 1) * limit;
        const query = { isDeleted: false, ...filters };

        // Remove undefined filters
        Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);

        const [semesters, total] = await Promise.all([
            SemesterRepository.find(query).skip(skip).limit(limit).populate('academicClass courses'),
            SemesterRepository.countDocuments(query),
        ]);

        return {
            semesters,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateSemester(id, data, institutionId) {
        const semester = await SemesterRepository.findById(id);
        if (!semester || semester.institution.toString() !== institutionId) {
            const error = new Error('Semester not found or unauthorized');
            error.status = 404;
            throw error;
        }

        // Validate academicClass if provided
        if (data.academicClass) {
            const academicClass = await AcademicClassRepository.findById(data.academicClass);
            if (!academicClass || academicClass.institution.toString() !== institutionId) {
                const error = new Error('Invalid or unauthorized academic class');
                error.status = 400;
                throw error;
            }
        }

        return SemesterRepository.update(id, data);
    }

    async deleteSemester(id, institutionId) {
        const semester = await SemesterRepository.findById(id);
        if (!semester || semester.institution.toString() !== institutionId) {
            const error = new Error('Semester not found or unauthorized');
            error.status = 404;
            throw error;
        }

        // Soft delete
        await SemesterRepository.update(id, { isDeleted: true });
    }
}

module.exports = new SemesterService();