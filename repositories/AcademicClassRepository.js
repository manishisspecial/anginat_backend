const AcademicClass = require("../models/AcademicClass");

class AcademicClassRepository {
  async createAcademicClass(classData) {
    return AcademicClass.create(classData);
  }

  async getAcademicClassById(classId, institutionId) {
    return AcademicClass.findOne({ _id: classId, institution: institutionId })
      .populate('institution', 'name')
      .populate('level', 'name category');
  }

  async getAllAcademicClasses(institutionId) {
    return AcademicClass.find({ institution: institutionId })
      .populate('institution', 'name')
      .populate('level', 'name category');
  }

  async updateAcademicClass(classId, classData, institutionId) {
    return AcademicClass.findOneAndUpdate(
      { _id: classId, institution: institutionId },
      classData,
      { new: true }
    )
      .populate('institution', 'name')
      .populate('level', 'name category');
  }

  async deleteAcademicClass(classId, institutionId) {
    return AcademicClass.findOneAndDelete({ _id: classId, institution: institutionId });
  }
}

module.exports = new AcademicClassRepository();