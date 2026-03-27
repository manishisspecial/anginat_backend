const express = require("express");
const AuthController = require("../controllers/AuthController");
const { verifyToken, hasAccess } = require("../middlewares/authMiddleware");
const upload = require("../utils/multerConfig");
const router = express.Router();


router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/update-password', AuthController.updatePassword);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get("/get-institution", verifyToken,AuthController.getInstitutionInfo);
router.get("/get-user", verifyToken,AuthController.getUserInfo);
router.post('/logout', AuthController.logout);
router.get('/verify-token', AuthController.verifyToken);
router.post('/find-user', AuthController.findUser);
router.get('/users/search', verifyToken, AuthController.searchUsers);
router.get('/users', verifyToken, AuthController.getUsersByRole);

router.post(
  "/create-user",
  verifyToken,
  hasAccess(["admin"]),
  AuthController.createUser
);

router.post("/update-user", verifyToken, AuthController.updateUserDetails);
router.put("/user/:userId", verifyToken, hasAccess(["admin", "super-admin"]), AuthController.updateUserByAdmin);
router.delete("/user/:userId", verifyToken, hasAccess(["admin", "super-admin"]), AuthController.deleteUser);
router.post("/upload-profile-image", verifyToken,upload.single("profile"), AuthController.uploadProfileImage);
router.post("/upload-cover-image", verifyToken, upload.single("cover"), AuthController.uploadCoverImage);
router.delete("/profile-image", verifyToken, AuthController.deleteProfileImage);

module.exports = router;
