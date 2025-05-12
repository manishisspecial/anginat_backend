const Section = require("../models/Section");

class SectionRepository {
  async createSection(sectionData) {
    return Section.create(sectionData);
  }

  async getSectionById(sectionId, institutionId) {
    return Section.findOne({
      _id: sectionId,
      academicClass: { $in: await require('../models/AcademicClass').find({ institution: institutionId }).distinct('_id') }
    })
      .populate({
        path: 'academicClass',
        populate: [
          { path: 'institution', select: 'name' },
          { path: 'level', select: 'name category' }
        ]
      });
  }

  async getAllSections(institutionId) {
    return Section.find({
      academicClass: { $in: await require('../models/AcademicClass').find({ institution: institutionId }).distinct('_id') }
    })
      .populate({
        path: 'academicClass',
        populate: [
          { path: 'institution', select: 'name' },
          { path: 'level', select: 'name category' }
        ]
      });
  }

  async updateSection(sectionId, sectionData, institutionId) {
    return Section.findOneAndUpdate(
      {
        _id: sectionId,
        academicClass: { $in: await require('../models/AcademicClass').find({ institution: institutionId }).distinct('_id') }
      },
      sectionData,
      { new: true }
    )
      .populate({
        path: 'academicClass',
        populate: [
          { path: 'institution', select: 'name' },
          { path: 'level', select: 'name category' }
        ]
      });
  }

  async deleteSection(sectionId, institutionId) {
    return Section.findOneAndDelete({
      _id: sectionId,
      academicClass: { $in: await require('../models/AcademicClass').find({ institution: institutionId }).distinct('_id') }
    });
  }

  async addCourseToSection(sectionId, courseId, institutionId) {
    return Section.findOneAndUpdate(
      {
        _id: sectionId,
        academicClass: { $in: await require('../models/AcademicClass').find({ institution: institutionId }).distinct('_id') },
        courses: { $ne: courseId } // Prevent duplicates
      },
      { $push: { courses: courseId } },
      { new: true }
    )
      .populate({
        path: 'academicClass',
        populate: [
          { path: 'institution', select: 'name' },
          { path: 'level', select: 'name category' }
        ]
      });
  }

  async removeCourseFromSection(sectionId, courseId, institutionId) {
    return Section.findOneAndUpdate(
      {
        _id: sectionId,
        academicClass: { $in: await require('../models/AcademicClass').find({ institution: institutionId }).distinct('_id') }
      },
      { $pull: { courses: courseId } },
      { new: true }
    )
      .populate({
        path: 'academicClass',
        populate: [
          { path: 'institution', select: 'name' },
          { path: 'level', select: 'name category' }
        ]
      });
  }
}

module.exports = new SectionRepository();