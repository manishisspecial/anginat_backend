const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const TimetableService = require("../services/TimetableService");
const mongoose = require('mongoose');

class TimetableController {
    async createTimetable(req, res) {
        if (!res) {
            console.error("Response object is undefined in createTimetable");
            return;
        }
        try {
            const timetableData = req.body;
            const { institution } = timetableData;
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            if (!institution || institution !== institutionId) {
                throw new Error("Institution mismatch or not provided");
            }
            const newTimetable = await TimetableService.createTimetable(timetableData);
            sendSuccessResponse(res, "Timetable created successfully", newTimetable);
        } catch (error) {
            console.error("Error in createTimetable:", error);
            sendErrorResponse(
                res,
                error.message === "Institution, academicClass, section, subject, instructor, semester, and weeklyHours are required" ? "Required fields missing" :
                    error.message === "Invalid ID(s) provided" ? "Invalid ID(s)" :
                        error.message === "Invalid degree ID" ? "Invalid degree ID" :
                            error.message === "Subject not found or does not belong to your institution" ? "Invalid subject" :
                                error.message === "Instructor must be an active user with role 'instructor'" ? "Invalid instructor" :
                                    error.message === "Instructor must be one of the subject’s assigned instructors" ? "Invalid instructor for subject" :
                                        error.message === "AcademicClass not found or does not belong to your institution" ? "Invalid academicClass" :
                                            error.message === "Section not found or does not belong to the specified academicClass" ? "Invalid section" :
                                                error.message === "Degree not found or does not belong to your institution" ? "Invalid degree" :
                                                    error.message === "AcademicClass and degree mismatch" ? "AcademicClass and degree mismatch" :
                                                        error.message === "Each schedule detail must include day, startTime, and endTime" ? "Invalid schedule details" :
                                                            error.message === "Institution mismatch or not provided" ? "Institution mismatch" :
                                                                error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                                                                    "Failed to create timetable",
                error.message === "Required fields missing" ||
                error.message === "Invalid ID(s)" ||
                error.message === "Invalid degree ID" ||
                error.message === "Invalid subject" ||
                error.message === "Invalid instructor" ||
                error.message === "Invalid instructor for subject" ||
                error.message === "Invalid academicClass" ||
                error.message === "Invalid section" ||
                error.message === "Invalid degree" ||
                error.message === "AcademicClass and degree mismatch" ||
                error.message === "Invalid schedule details" ||
                error.message === "Institution mismatch or not provided" ? 400 :
                    error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }

    async getTimetableById(req, res) {
        if (!res) {
            console.error("Response object is undefined in getTimetableById");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const { timetableId } = req.params;
            const timetable = await TimetableService.getTimetableById(timetableId, institutionId);
            sendSuccessResponse(res, "Timetable retrieved successfully", timetable);
        } catch (error) {
            console.error("Error in getTimetableById:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid timetable ID" ? "Invalid timetable ID" :
                    error.message === "Timetable not found or does not belong to your institution" ? "Timetable not found" :
                        error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                            "Failed to retrieve timetable",
                error.message === "Invalid timetable ID" ? 400 :
                    error.message === "Timetable not found or does not belong to your institution" ? 404 :
                        error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }

    async getAllTimetables(req, res) {
        if (!res) {
            console.error("Response object is undefined in getAllTimetables");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const timetables = await TimetableService.getAllTimetables(institutionId);
            sendSuccessResponse(res, "Timetables retrieved successfully", timetables);
        } catch (error) {
            console.error("Error in getAllTimetables:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                    "Failed to retrieve timetables",
                error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }

    async updateTimetable(req, res) {
        if (!res) {
            console.error("Response object is undefined in updateTimetable");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const { timetableId } = req.params;
            const timetableData = req.body;
            if (timetableData.institution && timetableData.institution !== institutionId) {
                throw new Error("Institution mismatch");
            }
            const updatedTimetable = await TimetableService.updateTimetable(timetableId, timetableData, institutionId);
            sendSuccessResponse(res, "Timetable updated successfully", updatedTimetable);
        } catch (error) {
            console.error("Error in updateTimetable:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid timetable ID" ? "Invalid timetable ID" :
                    error.message === "Timetable not found or does not belong to your institution" ? "Timetable not found" :
                        error.message === "Invalid subject ID" ? "Invalid subject ID" :
                            error.message === "Invalid academicClass ID" ? "Invalid academicClass ID" :
                                error.message === "Invalid section ID" ? "Invalid section ID" :
                                    error.message === "Invalid instructor ID" ? "Invalid instructor ID" :
                                        error.message === "Invalid degree ID" ? "Invalid degree ID" :
                                            error.message === "Subject not found or does not belong to your institution" ? "Invalid subject" :
                                                error.message === "Instructor must be an active user with role 'instructor'" ? "Invalid instructor" :
                                                    error.message === "Instructor must be one of the subject’s assigned instructors" ? "Invalid instructor for subject" :
                                                        error.message === "AcademicClass not found or does not belong to your institution" ? "Invalid academicClass" :
                                                            error.message === "Section not found or does not belong to the specified academicClass" ? "Invalid section" :
                                                                error.message === "Degree not found or does not belong to your institution" ? "Invalid degree" :
                                                                    error.message === "AcademicClass and degree mismatch" ? "AcademicClass and degree mismatch" :
                                                                        error.message === "Each schedule detail must include day, startTime, and endTime" ? "Invalid schedule details" :
                                                                            error.message === "Institution mismatch" ? "Institution mismatch" :
                                                                                error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                                                                                    "Failed to update timetable",
                error.message === "Invalid timetable ID" ||
                error.message === "Invalid subject ID" ||
                error.message === "Invalid academicClass ID" ||
                error.message === "Invalid section ID" ||
                error.message === "Invalid instructor ID" ||
                error.message === "Invalid degree ID" ||
                error.message === "Invalid subject" ||
                error.message === "Invalid instructor" ||
                error.message === "Invalid instructor for subject" ||
                error.message === "Invalid academicClass" ||
                error.message === "Invalid section" ||
                error.message === "Invalid degree" ||
                error.message === "AcademicClass and degree mismatch" ||
                error.message === "Invalid schedule details" ||
                error.message === "Institution mismatch" ? 400 :
                    error.message === "Timetable not found or does not belong to your institution" ? 404 :
                        error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }

    async deleteTimetable(req, res) {
        if (!res) {
            console.error("Response object is undefined in deleteTimetable");
            return;
        }
        try {
            const institutionId = req.user?.institution;
            if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
                throw new Error("Invalid institution ID from authentication");
            }
            const { timetableId } = req.params;
            const deletedTimetable = await TimetableService.deleteTimetable(timetableId, institutionId);
            sendSuccessResponse(res, "Timetable deleted successfully", deletedTimetable);
        } catch (error) {
            console.error("Error in deleteTimetable:", error);
            sendErrorResponse(
                res,
                error.message === "Invalid timetable ID" ? "Invalid timetable ID" :
                    error.message === "Timetable not found or does not belong to your institution" ? "Timetable not found" :
                        error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                            "Failed to delete timetable",
                error.message === "Invalid timetable ID" ? 400 :
                    error.message === "Timetable not found or does not belong to your institution" ? 404 :
                        error.message === "Invalid institution ID from authentication" ? 401 : 500,
                error.message
            );
        }
    }
}

module.exports = new TimetableController();