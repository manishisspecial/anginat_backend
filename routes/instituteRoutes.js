const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../utils/multerConfig');
// Import controllers
const InstituteController = require('../controllers/InstituteController');
const AcademicClassController = require('../controllers/AcademicClassController');
const LevelController = require('../controllers/LevelController');
const SectionController = require('../controllers/SectionController');
const DegreeController = require('../controllers/DegreeController');
const SubjectController = require('../controllers/SubjectController');
const TimetableController = require('../controllers/TimetableController');
const SemesterController = require('../controllers/SemesterController');

// Institute routes
router.route('/get-institute/:instituteId')
    .get(InstituteController.getInstituteDetails);
router.route('/update-details/:instituteId')
    .post(verifyToken, InstituteController.updateInstituteDetails);
router.route('/upload/:instituteId')
    .post(verifyToken, upload.single('file'), InstituteController.uploadFile);
router.route('/get-institute-by-domain')
    .post(InstituteController.getInstituteByDomain);

// Level routes
router.route('/levels')
    .get(verifyToken, LevelController.getAllLevels)
    .post(verifyToken, LevelController.createLevel);
router.route('/levels/:levelId')
    .get(verifyToken, LevelController.getLevelById)
    .put(verifyToken, LevelController.updateLevel)
    .delete(verifyToken, LevelController.deleteLevel);

// Academic Class routes
router.post('/classes', verifyToken, AcademicClassController.createAcademicClass);
router.get('/classes', verifyToken, AcademicClassController.getAllAcademicClasses);
router.get('/classes/:classId', verifyToken, AcademicClassController.getAcademicClassById);
router.put('/classes/:classId', verifyToken, AcademicClassController.updateAcademicClass);
router.delete('/classes/:classId', verifyToken, AcademicClassController.deleteAcademicClass);

// Subject routes
router.post('/subjects', verifyToken, SubjectController.createSubject);
router.get('/subjects', verifyToken, SubjectController.getAllSubjects);
router.get('/subjects/:subjectId', verifyToken, SubjectController.getSubjectById);
router.put('/subjects/:subjectId', verifyToken, SubjectController.updateSubject);
router.delete('/subjects/:subjectId', verifyToken, SubjectController.deleteSubject);

// Timetable routes
router.post('/timetables', verifyToken, TimetableController.createTimetable);
router.get('/timetables', verifyToken, TimetableController.getAllTimetables);
router.get('/timetables/:timetableId', verifyToken, TimetableController.getTimetableById);
router.put('/timetables/:timetableId', verifyToken, TimetableController.updateTimetable);
router.delete('/timetables/:timetableId', verifyToken, TimetableController.deleteTimetable);

// Degree routes
router.post('/degrees', verifyToken, DegreeController.createDegree);
router.get('/degrees', verifyToken, DegreeController.getAllDegrees);
router.get('/degrees/:degreeId', verifyToken, DegreeController.getDegreeById);
router.put('/degrees/:degreeId', verifyToken, DegreeController.updateDegree);
router.delete('/degrees/:degreeId', verifyToken, DegreeController.deleteDegree);

// Section routes
router.post('/sections', verifyToken, SectionController.createSection);
router.get('/sections', verifyToken, SectionController.getAllSections);
router.get('/sections/:sectionId', verifyToken, SectionController.getSectionById);
router.put('/sections/:sectionId', verifyToken, SectionController.updateSection);
router.delete('/sections/:sectionId', verifyToken, SectionController.deleteSection);

// Semester routes
router.post('/create/semesters', verifyToken, SemesterController.createSemester);
router.get('/get/semesters', verifyToken, SemesterController.getAllSemesters);
router.get('/semester/:id', verifyToken, SemesterController.getSemesterById);
router.put('/semester/:id', verifyToken, SemesterController.updateSemester);
router.delete('/semester/:id', verifyToken, SemesterController.deleteSemester);

module.exports = router;