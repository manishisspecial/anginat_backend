const AcademicClassRepository = require("../repositories/AcademicClassRepository");
const LevelRepository = require("../repositories/LevelRepository");
const Degree = require("../models/Degree");
const mongoose = require('mongoose');

class AcademicClassService {
  async createAcademicClass(classData) {
    const { name, institution, level, degree } = classData;
    if (!name || !institution) {
      throw new Error("Name and institution are required");
    }
    if (!level && !degree) {
      throw new Error("Either level or degree is required");
    }
    if (level && !mongoose.Types.ObjectId.isValid(level)) {
      throw new Error("Invalid level ID");
    }
    if (degree && !mongoose.Types.ObjectId.isValid(degree)) {
      throw new Error("Invalid degree ID");
    }
    if (level) {
      const levelExists = await LevelRepository.getLevelById(level, institution);
      if (!levelExists) {
        throw new Error("Level not found or does not belong to your institution");
      }
    }
    if (degree) {
      const degreeExists = await Degree.findOne({ _id: degree, institution });
      if (!degreeExists) {
        throw new Error("Degree not found or does not belong to your institution");
      }
    }
    return AcademicClassRepository.createAcademicClass(classData);
  }

  async getAcademicClassById(classId, institutionId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid academicClass ID");
    }
    const academicClass = await AcademicClassRepository.getAcademicClassById(classId, institutionId);
    if (!academicClass) {
      throw new Error("AcademicClass not found or does not belong to your institution");
    }
    return academicClass;
  }

  async getAllAcademicClasses(institutionId) {
    return AcademicClassRepository.getAllAcademicClasses(institutionId);
  }

  async updateAcademicClass(classId, classData, institutionId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid academicClass ID");
    }
    const { level, degree } = classData;
    if (level && !mongoose.Types.ObjectId.isValid(level)) {
      throw new Error("Invalid level ID");
    }
    if (degree && !mongoose.Types.ObjectId.isValid(degree)) {
      throw new Error("Invalid degree ID");
    }
    if (level) {
      const levelExists = await LevelRepository.getLevelById(level, institutionId);
      if (!levelExists) {
        throw new Error("Level not found or does not belong to your institution");
      }
    }
    if (degree) {
      const degreeExists = await Degree.findOne({ _id: degree, institution: institutionId });
      if (!degreeExists) {
        throw new Error("Degree not found or does not belong to your institution");
      }
    }
    const updatedClass = await AcademicClassRepository.updateAcademicClass(classId, classData, institutionId);
    if (!updatedClass) {
      throw new Error("AcademicClass not found or does not belong to your institution");
    }
    return updatedClass;
  }

  async deleteAcademicClass(classId, institutionId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid academicClass ID");
    }
    const deletedClass = await AcademicClassRepository.deleteAcademicClass(classId, institutionId);
    if (!deletedClass) {
      throw new Error("AcademicClass not found or does not belong to your institution");
    }
    return deletedClass;
  }
}

module.exports = new AcademicClassService();