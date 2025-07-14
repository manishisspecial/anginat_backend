const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const AcademicClassService = require("../services/AcademicClassService");
const mongoose = require("mongoose");
const InstituteController = require("./InstituteController");
const InstitutionService = require("../services/InstitutionService");
const {
  SCHOOL_CLASS_CODES,
  COLLEGE_CLASS_CODES,
} = require("../constants/input");

class AcademicClassController {
  async createAcademicClass(req, res) {
    if (!res) {
      console.error("Response object is undefined in createAcademicClass");
      return;
    }

    try {
      const classData = req.body;
      const institutionId = req.user?.institution;
      const institutionType = req.user?.institutionType;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }

      if (institutionType === "school") {
        if (!SCHOOL_CLASS_CODES.includes(classData.classCode)) {
          throw new Error("Invalid class code for school");
        }
      } else if (institutionType === "college") {
        if (!COLLEGE_CLASS_CODES.includes(classData.classCode)) {
          throw new Error("Invalid class code for college");
        }
      } else {
        throw new Error("Institute Type is not valid");
      }

      const newClass = await AcademicClassService.createAcademicClass({
        institution: institutionId,
        ...classData,
      });

      sendSuccessResponse(res, "AcademicClass created successfully", newClass);
    } catch (error) {
      console.error("Error in createAcademicClass:", error);
      sendErrorResponse(
        res,
        error.message === "Name and institution are required"
          ? "Required fields missing"
          : error.message === "Either level or degree is required"
            ? "Either level or degree is required"
            : error.message === "Invalid level ID"
              ? "Invalid level ID"
              : error.message === "Invalid degree ID"
                ? "Invalid degree ID"
                : error.message ===
                  "Level not found or does not belong to your institution"
                  ? "Invalid level"
                  : error.message ===
                    "Degree not found or does not belong to your institution"
                    ? "Invalid degree"
                    : error.message === "Institution mismatch or not provided"
                      ? "Institution mismatch"
                      : error.message === "Invalid institution ID from authentication"
                        ? "Invalid institution ID"
                        : error.message.includes("duplicate key error")
                          ? "AcademicClass with this name already exists for the level or degree"
                          : "Failed to create academicClass",
        error.message === "Required fields missing" ||
          error.message === "Either level or degree is required" ||
          error.message === "Invalid level ID" ||
          error.message === "Invalid degree ID" ||
          error.message === "Invalid level" ||
          error.message === "Invalid degree" ||
          error.message === "Institution mismatch or not provided"
          ? 400
          : error.message === "Invalid institution ID from authentication"
            ? 401
            : error.message.includes("duplicate key error")
              ? 409
              : 500,
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
      const academicClass = await AcademicClassService.getAcademicClassById(
        classId,
        institutionId
      );
      sendSuccessResponse(
        res,
        "AcademicClass retrieved successfully",
        academicClass
      );
    } catch (error) {
      console.error("Error in getAcademicClassById:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid academicClass ID"
          ? "Invalid academicClass ID"
          : error.message ===
            "AcademicClass not found or does not belong to your institution"
            ? "AcademicClass not found"
            : error.message === "Invalid institution ID from authentication"
              ? "Invalid institution ID"
              : "Failed to retrieve academicClass",
        error.message === "Invalid academicClass ID"
          ? 400
          : error.message ===
            "AcademicClass not found or does not belong to your institution"
            ? 404
            : error.message === "Invalid institution ID from authentication"
              ? 401
              : 500,
        error.message
      );
    }
  }

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
      const classes = await AcademicClassService.getAllAcademicClasses(
        institutionId
      );
      sendSuccessResponse(
        res,
        "AcademicClasses retrieved successfully",
        classes
      );
    } catch (error) {
      console.error("Error in getAllAcademicClasses:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : "Failed to retrieve academicClasses",
        error.message === "Invalid institution ID from authentication"
          ? 401
          : 500,
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
      if (classData.institution && classData.institution !== institutionId) {
        throw new Error("Institution mismatch");
      }
      const updatedClass = await AcademicClassService.updateAcademicClass(
        classId,
        classData,
        institutionId
      );
      sendSuccessResponse(
        res,
        "AcademicClass updated successfully",
        updatedClass
      );
    } catch (error) {
      console.error("Error in updateAcademicClass:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid academicClass ID"
          ? "Invalid academicClass ID"
          : error.message ===
            "AcademicClass not found or does not belong to your institution"
            ? "AcademicClass not found"
            : error.message === "Invalid level ID"
              ? "Invalid level ID"
              : error.message === "Invalid degree ID"
                ? "Invalid degree ID"
                : error.message ===
                  "Level not found or does not belong to your institution"
                  ? "Invalid level"
                  : error.message ===
                    "Degree not found or does not belong to your institution"
                    ? "Invalid degree"
                    : error.message === "Institution mismatch"
                      ? "Institution mismatch"
                      : error.message === "Invalid institution ID from authentication"
                        ? "Invalid institution ID"
                        : error.message.includes("duplicate key error")
                          ? "AcademicClass with this name already exists for the level or degree"
                          : "Failed to update academicClass",
        error.message === "Invalid academicClass ID" ||
          error.message === "Invalid level ID" ||
          error.message === "Invalid degree ID" ||
          error.message === "Invalid level" ||
          error.message === "Invalid degree" ||
          error.message === "Institution mismatch"
          ? 400
          : error.message ===
            "AcademicClass not found or does not belong to your institution"
            ? 404
            : error.message === "Invalid institution ID from authentication"
              ? 401
              : error.message.includes("duplicate key error")
                ? 409
                : 500,
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
      const deletedClass = await AcademicClassService.deleteAcademicClass(
        classId,
        institutionId
      );
      sendSuccessResponse(
        res,
        "AcademicClass deleted successfully",
        deletedClass
      );
    } catch (error) {
      console.error("Error in deleteAcademicClass:", error);
      sendErrorResponse(
        res,
        error.message === "Invalid academicClass ID"
          ? "Invalid academicClass ID"
          : error.message ===
            "AcademicClass not found or does not belong to your institution"
            ? "AcademicClass not found"
            : error.message === "Invalid institution ID from authentication"
              ? "Invalid institution ID"
              : "Failed to delete academicClass",
        error.message === "Invalid academicClass ID"
          ? 400
          : error.message ===
            "AcademicClass not found or does not belong to your institution"
            ? 404
            : error.message === "Invalid institution ID from authentication"
              ? 401
              : 500,
        error.message
      );
    }
  }
}

module.exports = new AcademicClassController();
