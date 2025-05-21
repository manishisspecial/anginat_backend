const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../utils/multerConfig');

// Import controllers
const InstituteController = require('../controllers/InstituteController');
const AcademicClassController = require('../controllers/AcademicClassController');
const LevelController = require('../controllers/LevelController');
const SectionController = require('../controllers/SectionController');

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


router.post('/sections', verifyToken, SectionController.createSection);
router.get('/sections', verifyToken, SectionController.getAllSections);
router.get('/sections/:sectionId', verifyToken, SectionController.getSectionById);
router.put('/sections/:sectionId', verifyToken, SectionController.updateSection);
router.delete('/sections/:sectionId', verifyToken, SectionController.deleteSection);
router.post('/sections/:sectionId/courses', verifyToken, SectionController.addCourseToSection);
router.delete('/sections/:sectionId/courses/:courseId', verifyToken, SectionController.removeCourseFromSection);

module.exports = router;