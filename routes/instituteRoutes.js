const InstituteController = require("../controllers/InstituteController");
const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../utils/multerConfig");
const router = express.Router();

router.get("/get-institute/:instituteId",InstituteController.getInstituteDetails);
router.post("/update-details/:instituteId",verifyToken,InstituteController.updateInstituteDetails)
router.post("/upload/:instituteId",verifyToken,upload.single("file"),InstituteController.uploadFile)


module.exports = router;
