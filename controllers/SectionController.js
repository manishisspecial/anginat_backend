const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const SectionService = require("../services/SectionService");
const AcademicClass = require("../models/AcademicClass");
const mongoose = require('mongoose');
const axios = require('axios');

class SectionController {
  async validateCourses(courseIds, institutionId) {
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return true; // No courses to validate
    }
    try {
      const response = await axios.post(`${process.env.COURSE_SERVICE_URL}/api/courses/validate`, {
        courseIds,
        institutionId
      });
      return response.data.valid;
    } catch (error) {
      throw new Error("Failed to validate courses: " + error.message);
    }
  }

  async getAllSections(req, res) {
    if (!res) {
      console.error("Response object is undefined in getAllSections");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const sections = await SectionService.getAllSections(institutionId);
      sendSuccessResponse(res, "Sections retrieved successfully", sections);
    } catch (error) {
      console.error("Error in getAllSections:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" : "Failed to retrieve sections",
        error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }

  async getSectionById(req, res) {
    if (!res) {
      console.error("Response object is undefined in getSectionById");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { sectionId } = req.params;
      const section = await SectionService.getSectionById(sectionId, institutionId);
      // Optionally fetch course details
      if (section.courses && section.courses.length > 0) {
        try {
          const response = await axios.post(`${process.env.COURSE_SERVICE_URL}/api/courses/details`, {
            courseIds: section.courses.map(id => id.toString())
          });
          section.courses = response.data;
        } catch (error) {
          console.warn("Failed to fetch course details:", error.message);
          section.courses = section.courses.map(id => ({ _id: id }));
        }
      }
      sendSuccessResponse(res, "Section retrieved successfully", section);
    } catch (error) {
      console.error("Error in getSectionById:", error);
      sendErrorResponse(
        res,
        error.message === "Section not found or does not belong to your institution" ? "Section not found" :
          error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
            "Failed to retrieve section",
        error.message === "Section not found or does not belong to your institution" ? 404 :
          error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }

  async createSection(req, res) {
    if (!res) {
      console.error("Response object is undefined in createSection");
      return;
    }
    try {
      const sectionData = req.body;
      const { academicClass, courses } = sectionData;
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      if (!academicClass) {
        throw new Error("AcademicClass is required");
      }
      if (!mongoose.Types.ObjectId.isValid(academicClass)) {
        throw new Error("Invalid academicClass ID");
      }
      const classExists = await AcademicClass.findOne({ _id: academicClass, institution: institutionId });
      if (!classExists) {
        throw new Error("AcademicClass not found or does not belong to your institution");
      }
      if (courses && courses.length > 0) {
        const isValid = await this.validateCourses(courses, institutionId);
        if (!isValid) {
          throw new Error("One or more course IDs are invalid or do not belong to your institution");
        }
      }
      const newSection = await SectionService.createSection(sectionData);
      sendSuccessResponse(res, "Section created successfully", newSection);
    } catch (error) {
      console.error("Error in createSection:", error);
      sendErrorResponse(
        res,
        error.message === "AcademicClass is required" ? "AcademicClass is required" :
          error.message === "Invalid academicClass ID" ? "Invalid academicClass ID" :
            error.message === "AcademicClass not found or does not belong to your institution" ? "AcademicClass not found" :
              error.message === "name and academicClass are required" ? "Required fields missing" :
                error.message.includes("duplicate key error") ? "Section with this name already exists in the academicClass" :
                  error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                    error.message.includes("Failed to validate courses") ? "Failed to validate courses" :
                      error.message === "One or more course IDs are invalid or do not belong to your institution" ? "Invalid courses" :
                        "Failed to create section",
        error.message === "AcademicClass is required" ||
        error.message === "Invalid academicClass ID" ||
        error.message === "AcademicClass not found or does not belong to your institution" ||
        error.message === "name and academicClass are required" ||
        error.message === "One or more course IDs are invalid or do not belong to your institution" ? 400 :
          error.message === "Invalid institution ID from authentication" ? 401 :
            error.message.includes("duplicate key error") ? 409 :
              error.message.includes("Failed to validate courses") ? 503 : 500,
        error.message
      );
    }
  }

  async updateSection(req, res) {
    if (!res) {
      console.error("Response object is undefined in updateSection");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { sectionId } = req.params;
      const sectionData = req.body;
      if (sectionData.academicClass) {
        if (!mongoose.Types.ObjectId.isValid(sectionData.academicClass)) {
          throw new Error("Invalid academicClass ID");
        }
        const classExists = await AcademicClass.findOne({ _id: sectionData.academicClass, institution: institutionId });
        if (!classExists) {
          throw new Error("AcademicClass not found or does not belong to your institution");
        }
      }
      if (sectionData.courses && sectionData.courses.length > 0) {
        const isValid = await this.validateCourses(sectionData.courses, institutionId);
        if (!isValid) {
          throw new Error("One or more course IDs are invalid or do not belong to your institution");
        }
      }
      const updatedSection = await SectionService.updateSection(sectionId, sectionData, institutionId);
      sendSuccessResponse(res, "Section updated successfully", updatedSection);
    } catch (error) {
      console.error("Error in updateSection:", error);
      sendErrorResponse(
        res,
        error.message === "Section not found or does not belong to your institution" ? "Section not found" :
          error.message === "Invalid academicClass ID" ? "Invalid academicClass ID" :
            error.message === "AcademicClass not found or does not belong to your institution" ? "AcademicClass not found" :
              error.message.includes("duplicate key error") ? "Section with this name already exists in the academicClass" :
                error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                  error.message.includes("Failed to validate courses") ? "Failed to validate courses" :
                    error.message === "One or more course IDs are invalid or do not belong to your institution" ? "Invalid courses" :
                      "Failed to update section",
        error.message === "Section not found or does not belong to your institution" ? 404 :
          error.message === "Invalid academicClass ID" ||
          error.message === "AcademicClass not found or does not belong to your institution" ||
          error.message === "One or more course IDs are invalid or do not belong to your institution" ? 400 :
            error.message === "Invalid institution ID from authentication" ? 401 :
              error.message.includes("duplicate key error") ? 409 :
                error.message.includes("Failed to validate courses") ? 503 : 500,
        error.message
      );
    }
  }

  async deleteSection(req, res) {
    if (!res) {
      console.error("Response object is undefined in deleteSection");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { sectionId } = req.params;
      const deletedSection = await SectionService.deleteSection(sectionId, institutionId);
      sendSuccessResponse(res, "Section deleted successfully", deletedSection);
    } catch (error) {
      console.error("Error in deleteSection:", error);
      sendErrorResponse(
        res,
        error.message === "Section not found or does not belong to your institution" ? "Section not found" :
          error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
            "Failed to delete section",
        error.message === "Section not found or does not belong to your institution" ? 404 :
          error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }

  async addCourseToSection(req, res) {
    if (!res) {
      console.error("Response object is undefined in addCourseToSection");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { sectionId } = req.params;
      const { courseId } = req.body;
      if (!courseId) {
        throw new Error("Course ID is required");
      }
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new Error("Invalid course ID");
      }
      // const isValid = await this.validateCourses([courseId], institutionId);
      // if (!isValid) {
      //   throw new Error("Course ID is invalid or does not belong to your institution");
      // }
      const updatedSection = await SectionService.addCourseToSection(sectionId, courseId, institutionId);
      sendSuccessResponse(res, "Course added to section successfully", updatedSection);
    } catch (error) {
      console.error("Error in addCourseToSection:", error);
      sendErrorResponse(
        res,
        error.message === "Course ID is required" ? "Course ID is required" :
          error.message === "Invalid course ID" ? "Invalid course ID" :
            error.message === "Course ID is invalid or does not belong to your institution" ? "Invalid course" :
              error.message === "Section not found, does not belong to your institution, or course already exists" ? "Section not found or course already exists" :
                error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                  error.message.includes("Failed to validate courses") ? "Failed to validate course" :
                    "Failed to add course to section",
        error.message === "Course ID is required" ||
        error.message === "Invalid course ID" ||
        error.message === "Course ID is invalid or does not belong to your institution" ? 400 :
          error.message === "Section not found, does not belong to your institution, or course already exists" ? 400 :
            error.message === "Invalid institution ID from authentication" ? 401 :
              error.message.includes("Failed to validate courses") ? 503 : 500,
        error.message
      );
    }
  }

  async removeCourseFromSection(req, res) {
    if (!res) {
      console.error("Response object is undefined in removeCourseFromSection");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { sectionId, courseId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new Error("Invalid course ID");
      }
      const updatedSection = await SectionService.removeCourseFromSection(sectionId, courseId, institutionId);
      sendSuccessResponse(res, "Course removed from section successfully", updatedSection);
    } catch (error) {
      console.error("Error in removeCourseFromSection:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid course ID" ? "Invalid course ID" :
          error.message === "Section not found or does not belong to your institution" ? "Section not found" :
            error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
              "Failed to remove course from section",
        error.message === "Invalid course ID" ? 400 :
          error.message === "Section not found or does not belong to your institution" ? 404 :
            error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }
}

module.exports = new SectionController();