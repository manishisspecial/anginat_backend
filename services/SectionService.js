const SectionRepository = require("../repositories/SectionRepository");

class SectionService {
  async createSection(sectionData) {
    const { name, academicClass } = sectionData;
    if (!name || !academicClass) {
      throw new Error("name and academicClass are required");
    }
    return SectionRepository.createSection(sectionData);
  }

  async getSectionById(sectionId, institutionId) {
    const section = await SectionRepository.getSectionById(sectionId, institutionId);
    if (!section) {
      throw new Error("Section not found or does not belong to your institution");
    }
    return section;
  }

  async getAllSections(institutionId) {
    return SectionRepository.getAllSections(institutionId);
  }

  async updateSection(sectionId, sectionData, institutionId) {
    const section = await SectionRepository.updateSection(sectionId, sectionData, institutionId);
    if (!section) {
      throw new Error("Section not found or does not belong to your institution");
    }
    return section;
  }

  async deleteSection(sectionId, institutionId) {
    const section = await SectionRepository.deleteSection(sectionId, institutionId);
    if (!section) {
      throw new Error("Section not found or does not belong to your institution");
    }
    return section;
  }
}

module.exports = new SectionService();