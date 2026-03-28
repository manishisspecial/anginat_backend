const SemesterRepository = require("../repositories/SemesterRepository");
const AcademicClassRepository = require("../repositories/AcademicClassRepository");
const mongoose = require("mongoose");

class SemesterService {
  async createSemester(data) {
    // Validate academicClass exists and belongs to the institution

    if (
      !data.academicClass ||
      !mongoose.Types.ObjectId.isValid(data.academicClass)
    ) {
      const error = new Error("Invalid or missing academic class ID");
      error.status = 400;
      throw error;
    }
    if (!data.degree || !mongoose.Types.ObjectId.isValid(data.degree)) {
      const error = new Error("Invalid or missing degree ID");
      error.status = 400;
      throw error;
    }

    // Validate courses array
    if (data.courses && Array.isArray(data.courses)) {
      for (const courseId of data.courses) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          const error = new Error("Invalid course ID in courses array");
          error.status = 400;
          throw error;
        }
      }
    }

    const { semesterNumber, startDate, endDate } = data;
    if (!semesterNumber || !startDate || !endDate) {
      const error = new Error(
        "Semester number, start date, and end date are required"
      );
      error.status = 400;
      throw error;
    }
    data.startDate = new Date(startDate);
    data.endDate = new Date(endDate);

    const academicClass = await AcademicClassRepository.findById(
      data.academicClass
    );

    if (
      !academicClass ||
      academicClass.institution._id.toString() !== data.institution.toString()
    ) {
      const error = new Error("Invalid or unauthorized academic class");
      error.status = 400;
      throw error;
    }

    // Create semester
    return SemesterRepository.create(data);
  }

  async getSemesterById(id, institutionId) {
    const semester = await SemesterRepository.findById(id);
    if (!semester || semester.institution._id.toString() !== institutionId) {
      const error = new Error("Semester not found or unauthorized");
      error.status = 404;
      throw error;
    }
    return semester;
  }

  async getAllSemesters({ page, limit, filters }) {
    const skip = (page - 1) * limit;
    const query = { isDeleted: false, ...filters };

    // Remove undefined filters
    Object.keys(query).forEach(
      (key) => query[key] === undefined && delete query[key]
    );

    const [semesters, total] = await Promise.all([
      SemesterRepository.find(query, skip, limit),
      SemesterRepository.countDocuments(query),
    ]);

    return {
      semesters,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateSemester(id, data, institutionId) {
    const semester = await SemesterRepository.findById(id);
    if (!semester || semester.institution._id.toString() !== institutionId) {
      const error = new Error("Semester not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // Validate academicClass if provided
    if (data.academicClass) {
      const academicClass = await AcademicClassRepository.findById(
        data.academicClass
      );
      if (
        !academicClass ||
        academicClass.institution.toString() !== institutionId
      ) {
        const error = new Error("Invalid or unauthorized academic class");
        error.status = 400;
        throw error;
      }
    }

    return SemesterRepository.update(id, data);
  }

  async deleteSemester(id, institutionId) {
    const semester = await SemesterRepository.findById(id);
    if (!semester || semester.institution._id.toString() !== institutionId) {
      const error = new Error("Semester not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // Soft delete
    await SemesterRepository.update(id, { isDeleted: true });
  }
}

module.exports = new SemesterService();
