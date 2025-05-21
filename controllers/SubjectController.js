const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const SubjectService = require("../services/SubjectService");
const mongoose = require('mongoose');

class SubjectController {
    async createSubject(req, res) {
        if (!res) {
            console.error("Response object is undefined in createSubject");
            return;
        }
        try {
            const subjectData = req.body;
            const { institution } = subjectData;
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            if (!institution || institution !== institutionId) {
                throw new Error("Institution mismatch or not provided");
            }
            const newSubject = await SubjectService.createSubject(subjectData);
            sendSuccessResponse(res, "Subject created successfully", newSubject);
        } catch (error) {
            console.error("Error in createSubject:", error);
            sendErrorResponse(
                res,
                error.message === "Name, code, institution, and instructors are required" ? "Required fields missing" :
                    error.message === "Invalid institution ID" ? "Invalid institution ID" :
                        error.message === "Invalid degree ID" ? "Invalid degree ID" :
                            error.message === "Invalid instructor ID(s)" ? "Invalid instructor ID(s)" :
                                error.message === "All instructors must be active users with role 'instructor'" ? "Invalid instructors" :
                                    error.message === "Degree not found or does not belong to your institution" ? "Invalid degree" :
                                        error.message === "Institution mismatch or not provided" ? "Institution mismatch" :
                                            error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                                                error.message.includes("duplicate key error") ? "Subject with this code already exists" :
                                                    "Failed to create subject",
                error.message === "Required fields missing" ||
                error.message === "Invalid institution ID" ||
                error.message === "Invalid degree ID" ||
                error.message === "Invalid instructor ID(s)" ||
                error.message === "Invalid instructors" ||
                error.message === "Invalid degree" ||
                error.message === "Institution mismatch or not provided" ? 400 :
                    error.message === "Invalid institution ID from authentication" ? 401 :
                        error.message.includes("duplicate key error") ? 409 : 500,
                error.message
            );
        }
    }

    async getSubjectById(req, res) {
        if (!res) {
            console.error("Response object is undefined in getSubjectById");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const { subjectId } = req.params;
            const subject = await SubjectService.getSubjectById(subjectId, institutionId);
            sendSuccessResponse(res, "Subject retrieved successfully", subject);
        } catch (error) {
            console.error("Error in getSubjectById:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid subject ID" ? "Invalid subject ID" :
                    error.message === "Subject not found or does not belong to your institution" ? "Subject not found" :
                        error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                            "Failed to retrieve subject",
                error.message === "Invalid subject ID" ? 400 :
                    error.message === "Subject not found or does not belong to your institution" ? 404 :
                        error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }

    async getAllSubjects(req, res) {
        if (!res) {
            console.error("Response object is undefined in getAllSubjects");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const subjects = await SubjectService.getAllSubjects(institutionId);
            sendSuccessResponse(res, "Subjects retrieved successfully", subjects);
        } catch (error) {
            console.error("Error in getAllSubjects:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                    "Failed to retrieve subjects",
                error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }

    async updateSubject(req, res) {
        if (!res) {
            console.error("Response object is undefined in updateSubject");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const { subjectId } = req.params;
            const subjectData = req.body;
            if (subjectData.institution && subjectData.institution !== institutionId) {
                throw new Error("Institution mismatch");
            }
            const updatedSubject = await SubjectService.updateSubject(subjectId, subjectData, institutionId);
            sendSuccessResponse(res, "Subject updated successfully", updatedSubject);
        } catch (error) {
            console.error("Error in updateSubject:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid subject ID" ? "Invalid subject ID" :
                    error.message === "Subject not found or does not belong to your institution" ? "Subject not found" :
                        error.message === "Invalid degree ID" ? "Invalid degree ID" :
                            error.message === "Invalid instructor ID(s)" ? "Invalid instructor ID(s)" :
                                error.message === "All instructors must be active users with role 'instructor'" ? "Invalid instructors" :
                                    error.message === "Degree not found or does not belong to your institution" ? "Invalid degree" :
                                        error.message === "Institution mismatch" ? "Institution mismatch" :
                                            error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                                                error.message.includes("duplicate key error") ? "Subject with this code already exists" :
                                                    "Failed to update subject",
                error.message === "Invalid subject ID" ||
                error.message === "Invalid degree ID" ||
                error.message === "Invalid instructor ID(s)" ||
                error.message === "Invalid instructors" ||
                error.message === "Invalid degree" ||
                error.message === "Institution mismatch" ? 400 :
                    error.message === "Subject not found or does not belong to your institution" ? 404 :
                        error.message === "Invalid institution ID from authentication" ? 401 :
                            error.message.includes("duplicate key error") ? 409 : 500,
                error.message
            );
        }
    }

    async deleteSubject(req, res) {
        if (!res) {
            console.error("Response object is undefined in deleteSubject");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const { subjectId } = req.params;
            const deletedSubject = await SubjectService.deleteSubject(subjectId, institutionId);
            sendSuccessResponse(res, "Subject deleted successfully", deletedSubject);
        } catch (error) {
            console.error("Error in deleteSubject:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid subject ID" ? "Invalid subject ID" :
                    error.message === "Subject not found or does not belong to your institution" ? "Subject not found" :
                        error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                            "Failed to delete subject",
                error.message === "Invalid subject ID" ? 400 :
                    error.message === "Subject not found or does not belong to your institution" ? 404 :
                        error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }
}

module.exports = new SubjectController();