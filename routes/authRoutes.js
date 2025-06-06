const express = require("express");
const AuthController = require("../controllers/AuthController");
const { verifyToken, hasAccess } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/register", AuthController.register);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/update-password", AuthController.updatePassword);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/get-institution", verifyToken, AuthController.getInstitutionInfo);
router.get("/get-user", verifyToken, AuthController.getUserInfo);
router.post("/logout", AuthController.logout);

router.post(
  "/create-user",
  verifyToken,
  hasAccess(["admin"]),
  AuthController.createUser
);
module.exports = router;
