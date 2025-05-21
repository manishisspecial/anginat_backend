const AcademicClassRepository = require("../repositories/AcademicClassRepository");

class AcademicClassService {
  async createAcademicClass(classData) {
    const { name, level } = classData;
    if (!name || !level) {
      throw new Error("name and level are required");
    }
    return AcademicClassRepository.createAcademicClass(classData);
  }

  async getAcademicClassById(classId, institutionId) {
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
    const academicClass = await AcademicClassRepository.updateAcademicClass(classId, classData, institutionId);
    if (!academicClass) {
      throw new Error("AcademicClass not found or does not belong to your institution");
    }
    return academicClass;
  }

  async deleteAcademicClass(classId, institutionId) {
    const academicClass = await AcademicClassRepository.deleteAcademicClass(classId, institutionId);
    if (!academicClass) {
      throw new Error("AcademicClass not found or does not belong to your institution");
    }
    return academicClass;
  }
}

module.exports = new AcademicClassService();