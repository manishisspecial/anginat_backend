const TimetableRepository = require("../repositories/TimetableRepository");
const SubjectRepository = require("../repositories/SubjectRepository");
const AcademicClassRepository = require("../repositories/AcademicClassRepository");
const SectionRepository = require("../repositories/SectionRepository");
const DegreeRepository = require("../repositories/DegreeRepository");
const User = require("../models/User");
const mongoose = require('mongoose');

class TimetableService {
    async createTimetable(timetableData) {
        const { institution, academicClass, section, subject, degree, instructor, semester, weeklyHours, scheduleDetails } = timetableData;
        if (!institution || !academicClass || !section || !subject || !instructor || !semester || !weeklyHours) {
            throw new Error("Institution, academicClass, section, subject, instructor, semester, and weeklyHours are required");
        }
        if (!mongoose.Types.ObjectId.isValid(institution) ||
            !mongoose.Types.ObjectId.isValid(academicClass) ||
            !mongoose.Types.ObjectId.isValid(section) ||
            !mongoose.Types.ObjectId.isValid(subject) ||
            !mongoose.Types.ObjectId.isValid(instructor)) {
            throw new Error("Invalid ID(s) provided");
        }
        if (degree && !mongoose.Types.ObjectId.isValid(degree)) {
            throw new Error("Invalid degree ID");
        }
        // Validate subject
        const subjectDoc = await SubjectRepository.getSubjectById(subject, institution);
        if (!subjectDoc) {
            throw new Error("Subject not found or does not belong to your institution");
        }
        // Validate instructor
        const userDoc = await User.findById(instructor);
        if (!userDoc || userDoc.role !== 'instructor' || userDoc.status !== 'active') {
            throw new Error("Instructor must be an active user with role 'instructor'");
        }
        // Validate instructor is in subject's instructors
        if (!subjectDoc.instructors.some(id => id.equals(instructor))) {
            throw new Error("Instructor must be one of the subject’s assigned instructors");
        }
        // Validate academicClass
        const classDoc = await AcademicClassRepository.getAcademicClassById(academicClass, institution);
        if (!classDoc) {
            throw new Error("AcademicClass not found or does not belong to your institution");
        }
        // Validate section belongs to academicClass
        const sectionDoc = await SectionRepository.getSectionByIdByClass(section, academicClass, institution);
        if (!sectionDoc) {
            throw new Error("Section not found or does not belong to the specified academicClass");
        }
        // Validate degree if provided
        if (degree) {
            const degreeDoc = await DegreeRepository.getDegreeById(degree, institution);
            if (!degreeDoc) {
                throw new Error("Degree not found or does not belong to your institution");
            }
            if (!classDoc.degree || !classDoc.degree.equals(degree)) {
                throw new Error("AcademicClass does not belong to the specified degree");
            }
        }
        // Validate scheduleDetails
        if (scheduleDetails && scheduleDetails.length > 0) {
            for (const slot of scheduleDetails) {
                if (!slot.day || !slot.startTime || !slot.endTime) {
                    throw new Error("Each schedule detail must include day, startTime, and endTime");
                }
            }
        }
        return TimetableRepository.createTimetable(timetableData);
    }

    async getTimetableById(timetableId, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(timetableId)) {
            throw new Error("Invalid timetable ID");
        }
        const timetable = await TimetableRepository.getTimetableById(timetableId, institutionId);
        if (!timetable) {
            throw new Error("Timetable not found or does not belong to your institution");
        }
        return timetable;
    }

    async getAllTimetables(institutionId) {
        return TimetableRepository.getAllTimetables(institutionId);
    }

    async updateTimetable(timetableId, timetableData, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(timetableId)) {
            throw new Error("Invalid timetable ID");
        }
        const { academicClass, section, subject, degree, instructor, scheduleDetails } = timetableData;
        if (subject && !mongoose.Types.ObjectId.isValid(subject)) {
            throw new Error("Invalid subject ID");
        }
        if (academicClass && !mongoose.Types.ObjectId.isValid(academicClass)) {
            throw new Error("Invalid academicClass ID");
        }
        if (section && !mongoose.Types.ObjectId.isValid(section)) {
            throw new Error("Invalid section ID");
        }
        if (instructor && !mongoose.Types.ObjectId.isValid(instructor)) {
            throw new Error("Invalid instructor ID");
        }
        if (degree && !mongoose.Types.ObjectId.isValid(degree)) {
            throw new Error("Invalid degree ID");
        }
        if (subject) {
            const subjectDoc = await SubjectRepository.getSubjectById(subject, institutionId);
            if (!subjectDoc) {
                throw new Error("Subject not found or does not belong to your institution");
            }
            if (instructor) {
                const userDoc = await User.findById(instructor);
                if (!userDoc || userDoc.role !== 'instructor' || userDoc.status !== 'active') {
                    throw new Error("Instructor must be an active user with role 'instructor'");
                }
                if (!subjectDoc.instructors.some(id => id.equals(instructor))) {
                    throw new Error("Instructor must be one of the subject’s assigned instructors");
                }
            }
        }
        if (academicClass) {
            const classDoc = await AcademicClassRepository.getAcademicClassById(academicClass, institutionId);
            if (!classDoc) {
                throw new Error("AcademicClass not found or does not belong to your institution");
            }
            if (section) {
                const sectionDoc = await SectionRepository.getSectionByIdByClass(section, academicClass, institutionId);
                if (!sectionDoc) {
                    throw new Error("Section not found or does not belong to the specified academicClass");
                }
            }
            if (degree) {
                const degreeDoc = await DegreeRepository.getDegreeById(degree, institutionId);
                if (!degreeDoc) {
                    throw new Error("Degree not found or does not belong to your institution");
                }
                if (!classDoc.degree || !classDoc.degree.equals(degree)) {
                    throw new Error("AcademicClass does not belong to the specified degree");
                }
            }
        }
        if (scheduleDetails && scheduleDetails.length > 0) {
            for (const slot of scheduleDetails) {
                if (!slot.day || !slot.startTime || !slot.endTime) {
                    throw new Error("Each schedule detail must include day, startTime, and endTime");
                }
            }
        }
        const updatedTimetable = await TimetableRepository.updateTimetable(timetableId, timetableData, institutionId);
        if (!updatedTimetable) {
            throw new Error("Timetable not found or does not belong to your institution");
        }
        return updatedTimetable;
    }

    async deleteTimetable(timetableId, institutionId) {
        if (!mongoose.Types.ObjectId.isValid(timetableId)) {
            throw new Error("Invalid timetable ID");
        }
        const deletedTimetable = await TimetableRepository.deleteTimetable(timetableId, institutionId);
        if (!deletedTimetable) {
            throw new Error("Timetable not found or does not belong to your institution");
        }
        return deletedTimetable;
    }
}

module.exports = new TimetableService();