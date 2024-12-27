const InstituteController = require("../controllers/InstituteController");
const express = require("express");
const router = express.Router();

router.get(
  "/get-institute/:instituteId",
  InstituteController.getInstituteDetails
);

module.exports = router;
