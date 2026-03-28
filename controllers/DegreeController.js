const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const DegreeService = require("../services/DegreeService");
const mongoose = require("mongoose");
const InstitutionService = require("../services/InstitutionService");

class DegreeController {
  async createDegree(req, res) {
    if (!res) {
      return;
    }
    try {
      const degreeData = req.body;
      const institutionId = req.user?.institution;
      const institutionType = req.user?.institutionType;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }

      if (institutionType !== "college") {
        throw new Error("Only colleges are allowed to create degrees");
      } 

      const newDegree = await DegreeService.createDegree({
        institution: institutionId,
        ...degreeData,
      });
      
      sendSuccessResponse(res, "Degree created successfully", newDegree);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message ===
          "Name, shortCode, duration, totalSemesters, and institution are required"
          ? "Required fields missing"
          : error.message === "Institution mismatch or not provided"
          ? "Institution mismatch"
          : error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : error.message.includes("duplicate key error")
          ? "Degree with this name already exists"
          : "Failed to create degree",
        error.message === "Required fields missing" ||
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

  async getDegreeById(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { degreeId } = req.params;
      const degree = await DegreeService.getDegreeById(degreeId, institutionId);
      sendSuccessResponse(res, "Degree retrieved successfully", degree);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message === "Invalid degree ID"
          ? "Invalid degree ID"
          : error.message ===
            "Degree not found or does not belong to your institution"
          ? "Degree not found"
          : error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : "Failed to retrieve degree",
        error.message === "Invalid degree ID"
          ? 400
          : error.message ===
            "Degree not found or does not belong to your institution"
          ? 404
          : error.message === "Invalid institution ID from authentication"
          ? 401
          : 500,
        error.message
      );
    }
  }

  async getAllDegrees(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const degrees = await DegreeService.getAllDegrees(institutionId);
      sendSuccessResponse(res, "Degrees retrieved successfully", degrees);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : "Failed to retrieve degrees",
        error.message === "Invalid institution ID from authentication"
          ? 401
          : 500,
        error.message
      );
    }
  }

  async updateDegree(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { degreeId } = req.params;
      const degreeData = req.body;
      if (degreeData.institution && degreeData.institution !== institutionId) {
        throw new Error("Institution mismatch");
      }
      const updatedDegree = await DegreeService.updateDegree(
        degreeId,
        degreeData,
        institutionId
      );
      sendSuccessResponse(res, "Degree updated successfully", updatedDegree);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message === "Invalid degree ID"
          ? "Invalid degree ID"
          : error.message ===
            "Degree not found or does not belong to your institution"
          ? "Degree not found"
          : error.message === "Institution mismatch"
          ? "Institution mismatch"
          : error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : error.message.includes("duplicate key error")
          ? "Degree with this name already exists"
          : "Failed to update degree",
        error.message === "Invalid degree ID" ||
          error.message === "Institution mismatch"
          ? 400
          : error.message ===
            "Degree not found or does not belong to your institution"
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

  async deleteDegree(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { degreeId } = req.params;
      const deletedDegree = await DegreeService.deleteDegree(
        degreeId,
        institutionId
      );
      sendSuccessResponse(res, "Degree deleted successfully", deletedDegree);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message === "Invalid degree ID"
          ? "Invalid degree ID"
          : error.message ===
            "Degree not found or does not belong to your institution"
          ? "Degree not found"
          : error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : "Failed to delete degree",
        error.message === "Invalid degree ID"
          ? 400
          : error.message ===
            "Degree not found or does not belong to your institution"
          ? 404
          : error.message === "Invalid institution ID from authentication"
          ? 401
          : 500,
        error.message
      );
    }
  }
}

module.exports = new DegreeController();
