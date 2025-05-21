const AcademicClass = require("../models/AcademicClass");
const {Types} = require("mongoose");

class AcademicClassRepository {
  async createAcademicClass(classData) {
    return AcademicClass.create(classData);
  }

  async getAcademicClassById(classId, institutionId) {
    return AcademicClass.findOne({
      _id: classId,
      institution: institutionId
    })
        .populate('institution', 'name')
        .populate('level', 'name')
        .populate('degree', 'name shortCode');
  }
  async findById(classId) {
    // Validate classId
    /*if (!Types.ObjectId.isValid(classId)) {
      const error = new Error('Invalid AcademicClass ID');
      error.status = 400;
      throw error;
    }*/

    const academicClass = await AcademicClass.findOne({ _id: classId })
        .populate('institution', 'name')
        .populate('level', 'name')
        .populate('degree', 'name shortCode')
        .exec();

    if (!academicClass) {
      const error = new Error('AcademicClass not found');
      error.status = 404;
      throw error;
    }

    return academicClass;
  }


  async getAllAcademicClasses(institutionId) {
    return AcademicClass.find({ institution: institutionId })
        .populate('institution', 'name')
        .populate('level', 'name')
        .populate('degree', 'name shortCode');
  }

  async updateAcademicClass(classId, classData, institutionId) {
    return AcademicClass.findOneAndUpdate(
        { _id: classId, institution: institutionId },
        classData,
        { new: true }
    )
        .populate('institution', 'name')
        .populate('level', 'name')
        .populate('degree', 'name shortCode');
  }


  async deleteAcademicClass(classId, institutionId) {
    return AcademicClass.findOneAndDelete({
      _id: classId,
      institution: institutionId
    });
  }
}

module.exports = new AcademicClassRepository();