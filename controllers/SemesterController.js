const SemesterService = require('../services/SemesterService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

class SemesterController {
    async createSemester(req, res) {
        try {
            const data = {
                ...req.body,
                institution: req.user.institutionId,
            };
            const semester = await SemesterService.createSemester(data);
            return sendSuccessResponse(res, 'Semester created successfully', semester, 201);
        } catch (error) {
            return sendErrorResponse(res, error.message, error.status || 400);
        }
    }

    async getSemesterById(req, res) {
        try {
            const { id } = req.params;
            const semester = await SemesterService.getSemesterById(id, req.user.institutionId);
            return sendSuccessResponse(res, 'Semester retrieved successfully', semester);
        } catch (error) {
            return sendErrorResponse(res, error.message, error.status || 400);
        }
    }

    async getAllSemesters(req, res) {
        try {
            const { page = 1, limit = 10, academicClass } = req.query;
            const filters = {
                institution: req.user.institutionId,
                academicClass,
            };
            const result = await SemesterService.getAllSemesters({ page, limit, filters });
            return sendSuccessResponse(res, 'Semesters retrieved successfully', result);
        } catch (error) {
            return sendErrorResponse(res, error.message, error.status || 400);
        }
    }

    async updateSemester(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const semester = await SemesterService.updateSemester(id, data, req.user.institutionId);
            return sendSuccessResponse(res, 'Semester updated successfully', semester);
        } catch (error) {
            return sendErrorResponse(res, error.message, error.status || 400);
        }
    }

    async deleteSemester(req, res) {
        try {
            const { id } = req.params;
            await SemesterService.deleteSemester(id, req.user.institutionId);
            return sendSuccessResponse(res, 'Semester deleted successfully', null);
        } catch (error) {
            return sendErrorResponse(res, error.message, error.status || 400);
        }
    }
}

module.exports = new SemesterController();