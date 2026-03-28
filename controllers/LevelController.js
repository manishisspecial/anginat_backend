const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const LevelService = require("../services/LevelService");
const mongoose = require("mongoose");
const Institution = require("../models/Institution");

class LevelController {
  async getAllLevels(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const levels = await LevelService.getAllLevels(institutionId);
      sendSuccessResponse(res, "Levels retrieved successfully", levels);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message === "Invalid institution ID from authentication"
          ? "Invalid institution ID"
          : "Failed to retrieve levels",
        error.message === "Invalid institution ID from authentication"
          ? 401
          : 500,
        error.message
      );
    }
  }

  async getLevelById(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { levelId } = req.params;
      const level = await LevelService.getLevelById(levelId, institutionId);
      sendSuccessResponse(res, "Level retrieved successfully", level);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message ===
          "Level not found or does not belong to your institution"
          ? "Level not found"
          : error.message === "Invalid institution ID from authentication"
            ? "Invalid institution ID"
            : "Failed to retrieve level",
        error.message ===
          "Level not found or does not belong to your institution"
          ? 404
          : error.message === "Invalid institution ID from authentication"
            ? 401
            : 500,
        error.message
      );
    }
  }

  async createLevel(req, res) {
    if (!res) {
      return;
    }
    try {
      const levelData = req.body;

      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }


      const institutionExists = await Institution.findById(institutionId);
      if (!institutionExists) {
        throw new Error("Institution not found");
      }
      const newLevel = await LevelService.createLevel({ institution: institutionId, ...levelData });

      sendSuccessResponse(res, "Level created successfully", newLevel);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message === "Institution is required"
          ? "Institution is required"
          : error.message === "Invalid institution ID"
            ? "Invalid institution ID"
            : error.message === "Institution not found"
              ? "Institution not found"
              : error.message === "Cannot create level for another institution"
                ? "Unauthorized institution"
                : error.message === "levelNumber, name, and category are required"
                  ? "Required fields missing"
                  : error.message === "Invalid category"
                    ? "Invalid category"
                    : error.message.includes("duplicate key error")
                      ? "Level with this institution, category, and levelNumber already exists"
                      : error.message === "Invalid institution ID from authentication"
                        ? "Invalid institution ID"
                        : "Failed to create level",
        error.message === "Institution is required" ||
          error.message === "Invalid institution ID" ||
          error.message === "Institution not found" ||
          error.message === "Cannot create level for another institution" ||
          error.message === "levelNumber, name, and category are required" ||
          error.message === "Invalid category"
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

  async updateLevel(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { levelId } = req.params;
      const levelData = req.body;
      if (levelData.institution) {
        if (!mongoose.Types.ObjectId.isValid(levelData.institution)) {
          throw new Error("Invalid institution ID");
        }
        if (levelData.institution !== institutionId) {
          throw new Error("Cannot update level to another institution");
        }
        const institutionExists = await Institution.findById(
          levelData.institution
        );
        if (!institutionExists) {
          throw new Error("Institution not found");
        }
      }
      const updatedLevel = await LevelService.updateLevel(
        levelId,
        levelData,
        institutionId
      );
      sendSuccessResponse(res, "Level updated successfully", updatedLevel);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message ===
          "Level not found or does not belong to your institution"
          ? "Level not found"
          : error.message === "Invalid institution ID"
            ? "Invalid institution ID"
            : error.message === "Institution not found"
              ? "Institution not found"
              : error.message === "Cannot update level to another institution"
                ? "Unauthorized institution"
                : error.message.includes("duplicate key error")
                  ? "Level with this institution, category, and levelNumber already exists"
                  : error.message === "Invalid institution ID from authentication"
                    ? "Invalid institution ID"
                    : "Failed to update level",
        error.message ===
          "Level not found or does not belong to your institution"
          ? 404
          : error.message === "Invalid institution ID" ||
            error.message === "Institution not found" ||
            error.message === "Cannot update level to another institution"
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

  async deleteLevel(req, res) {
    if (!res) {
      return;
    }
    try {
      const institutionId = req.user?.institution;
      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID from authentication");
      }
      const { levelId } = req.params;
      const deletedLevel = await LevelService.deleteLevel(
        levelId,
        institutionId
      );
      sendSuccessResponse(res, "Level deleted successfully", deletedLevel);
    } catch (error) {
      sendErrorResponse(
        res,
        error.message ===
          "Level not found or does not belong to your institution"
          ? "Level not found"
          : error.message === "Invalid institution ID from authentication"
            ? "Invalid institution ID"
            : "Failed to delete level",
        error.message ===
          "Level not found or does not belong to your institution"
          ? 404
          : error.message === "Invalid institution ID from authentication"
            ? 401
            : 500,
        error.message
      );
    }
  }
}

module.exports = new LevelController();
