const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const AcademicClassService = require("../services/AcademicClassService");
const mongoose = require('mongoose');
const Institution = require("../models/Institution");
const Level = require("../models/Level");

class AcademicClassController {
  async getAllAcademicClasses(req, res) {
    if (!res) {
      console.error("Response object is undefined in getAllAcademicClasses");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const classes = await AcademicClassService.getAllAcademicClasses(institutionId);
      sendSuccessResponse(res, "AcademicClasses retrieved successfully", classes);
    } catch (error) {
      console.error("Error in getAllAcademicClasses:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" : "Failed to retrieve classes",
        error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }

  async getAcademicClassById(req, res) {
    if (!res) {
      console.error("Response object is undefined in getAcademicClassById");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { classId } = req.params;
      const academicClass = await AcademicClassService.getAcademicClassById(classId, institutionId);
      sendSuccessResponse(res, "AcademicClass retrieved successfully", academicClass);
    } catch (error) {
      console.error("Error in getAcademicClassById:", error);
      sendErrorResponse(
        res,
        error.message === "AcademicClass not found or does not belong to your institution" ? "AcademicClass not found" :
          error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
            "Failed to retrieve class",
        error.message === "AcademicClass not found or does not belong to your institution" ? 404 :
          error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }

  async createAcademicClass(req, res) {
    if (!res) {
      console.error("Response object is undefined in createAcademicClass");
      return;
    }
    try {
      const classData = req.body;
      const { institution, level } = classData;
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      if (!institution) {
        throw new Error("Institution is required");
      }
      if (!mongoose.Types.ObjectId.isValid(institution)) {
        throw new Error("Invalid institution ID");
      }
      if (institution !== institutionId) {
        throw new Error("Cannot create class for another institution");
      }
      const institutionExists = await Institution.findById(institution);
      if (!institutionExists) {
        throw new Error("Institution not found");
      }
      if (!level) {
        throw new Error("Level is required");
      }
      if (!mongoose.Types.ObjectId.isValid(level)) {
        throw new Error("Invalid level ID");
      }
      const levelExists = await Level.findOne({ _id: level, institution: institutionId });
      if (!levelExists) {
        throw new Error("Level not found or does not belong to your institution");
      }
      const newClass = await AcademicClassService.createAcademicClass(classData);
      sendSuccessResponse(res, "AcademicClass created successfully", newClass);
    } catch (error) {
      console.error("Error in createAcademicClass:", error);
      sendErrorResponse(
        res,
        error.message === "Institution is required" ? "Institution is required" :
          error.message === "Invalid institution ID" ? "Invalid institution ID" :
            error.message === "Institution not found" ? "Institution not found" :
              error.message === "Cannot create class for another institution" ? "Unauthorized institution" :
                error.message === "Level is required" ? "Level is required" :
                  error.message === "Invalid level ID" ? "Invalid level ID" :
                    error.message === "Level not found or does not belong to your institution" ? "Level not found" :
                      error.message === "name and level are required" ? "Required fields missing" :
                        error.message.includes("duplicate key error") ? "AcademicClass with this name already exists in the institution" :
                          error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                            "Failed to create class",
        error.message === "Institution is required" ||
        error.message === "Invalid institution ID" ||
        error.message === "Institution not found" ||
        error.message === "Cannot create class for another institution" ||
        error.message === "Level is required" ||
        error.message === "Invalid level ID" ||
        error.message === "Level not found or does not belong to your institution" ||
        error.message === "name and level are required" ? 400 :
          error.message === "Invalid institution ID from authentication" ? 401 :
            error.message.includes("duplicate key error") ? 409 : 500,
        error.message
      );
    }
  }

  async updateAcademicClass(req, res) {
    if (!res) {
      console.error("Response object is undefined in updateAcademicClass");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { classId } = req.params;
      const classData = req.body;
      if (classData.institution) {
        if (!mongoose.Types.ObjectId.isValid(classData.institution)) {
          throw new Error("Invalid institution ID");
        }
        if (classData.institution !== institutionId) {
          throw new Error("Cannot update class to another institution");
        }
        const institutionExists = await Institution.findById(classData.institution);
        if (!institutionExists) {
          throw new Error("Institution not found");
        }
      }
      if (classData.level) {
        if (!mongoose.Types.ObjectId.isValid(classData.level)) {
          throw new Error("Invalid level ID");
        }
        const levelExists = await Level.findOne({ _id: classData.level, institution: institutionId });
        if (!levelExists) {
          throw new Error("Level not found or does not belong to your institution");
        }
      }
      const updatedClass = await AcademicClassService.updateAcademicClass(classId, classData, institutionId);
      sendSuccessResponse(res, "AcademicClass updated successfully", updatedClass);
    } catch (error) {
      console.error("Error in updateAcademicClass:", error);
      sendErrorResponse(
        res,
        error.message === "AcademicClass not found or does not belong to your institution" ? "AcademicClass not found" :
          error.message === "Invalid institution ID" ? "Invalid institution ID" :
            error.message === "Institution not found" ? "Institution not found" :
              error.message === "Cannot update class to another institution" ? "Unauthorized institution" :
                error.message === "Invalid level ID" ? "Invalid level ID" :
                  error.message === "Level not found or does not belong to your institution" ? "Level not found" :
                    error.message.includes("duplicate key error") ? "AcademicClass with this name already exists in the institution" :
                      error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
                        "Failed to update class",
        error.message === "AcademicClass not found or does not belong to your institution" ? 404 :
          error.message === "Invalid institution ID" ||
          error.message === "Institution not found" ||
          error.message === "Cannot update class to another institution" ||
          error.message === "Invalid level ID" ||
          error.message === "Level not found or does not belong to your institution" ? 400 :
            error.message === "Invalid institution ID from authentication" ? 401 :
              error.message.includes("duplicate key error") ? 409 : 500,
        error.message
      );
    }
  }

  async deleteAcademicClass(req, res) {
    if (!res) {
      console.error("Response object is undefined in deleteAcademicClass");
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { classId } = req.params;
      const deletedClass = await AcademicClassService.deleteAcademicClass(classId, institutionId);
      sendSuccessResponse(res, "AcademicClass deleted successfully", deletedClass);
    } catch (error) {
      console.error("Error in deleteAcademicClass:", error);
      sendErrorResponse(
        res,
        error.message === "AcademicClass not found or does not belong to your institution" ? "AcademicClass not found" :
          error.message === "Invalid institution ID from authentication" ? "Invalid institution ID" :
            "Failed to delete class",
        error.message === "AcademicClass not found or does not belong to your institution" ? 404 :
          error.message === "Invalid institution ID from authentication" ? 401 : 500,
        error.message
      );
    }
  }
}

module.exports = new AcademicClassController();