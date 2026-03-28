const UserService = require("../services/UserService");
const InstitutionService = require("../services/InstitutionService");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const OtpService = require("../services/OtpService");
const UserRepository = require("../repositories/UserRepository");
const imagekit = require("../utils/imageKit");
const { updateUserDataSchema, adminUpdateUserSchema } = require("../validations/UserValidation");
const connectDatabase = require("../config/database");

class AuthController {
  async register(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        email,
        phoneNumber,
        countryCode = '+91',
        username,
        password,
        role: rawRole,
        status,
        name,
        institutionData,
      } = req.body;

      const role = rawRole ? rawRole.toLowerCase() : rawRole;

      if (role === "instructor" && !name) {
        await session.abortTransaction();
        return sendErrorResponse(res, "Name is required for instructors", 400);
      }

      // Validate institutionId requirement for specific roles
      if (
        ["instructor", "admin", "super-admin"].includes(role) &&
        !institutionData
      ) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "Institution data is required for this role",
          400
        );
      }

      const existingUserByEmail = await UserService.findByEmail(email);
      if (existingUserByEmail) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "User with this email already exists",
          400
        );
      }
      const existingUserByUsername = await UserService.findByUsername(username);
      if (existingUserByUsername) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "User with this username already exists",
          400
        );
      }


      const existingInstitutionByDomain = await InstitutionService.findByDomain(
        institutionData.domainName
      );
      if (existingInstitutionByDomain) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "Institution with this domain already exists",
          400
        );
      }

      /*const existingInstitutionByEmail = await InstitutionService.findByInstitutionEmail(institutionData.email);
            if (existingInstitutionByEmail) {
                await session.abortTransaction();
                return sendErrorResponse(res, "Institution with this email already exists", 400);
            }*/

      const existingUserByPhone = await UserService.findByPhone(phoneNumber);
      if (existingUserByPhone) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "User with this phone number already exists",
          400
        );
      }

      const institution = await InstitutionService.findOrCreateInstitution(
        institutionData,
        { session }
      );
      if (!institution) {
        await session.abortTransaction();
        return sendErrorResponse(res, "Failed to create institution", 500);
      }

      const user = await UserService.createUser(
        {
          email,
          phoneNumber,
          countryCode,
          username,
          password,
          role,
          status,
          name, // Include name
          institutionId: institution._id,
        },
        { session }
      );

      if (!user) {
        await session.abortTransaction();
        return sendErrorResponse(res, "Failed to create user", 500);
      }
      await session.commitTransaction();

      return sendSuccessResponse(
        res,
        "User and institution registered successfully",
        {
          userId: user._id,
          institutionId: institution._id,
        }
      );
    } catch (error) {
      await session.abortTransaction();
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const errorMessage =
          field === "phoneNumber"
            ? "Phone number already exists"
            : `${field.charAt(0).toUpperCase() + field.slice(1)
            } already exists`;
        return sendErrorResponse(res, errorMessage, 400);
      }
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return sendErrorResponse(res, messages.join(", "), 400);
      }
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    } finally {
      session.endSession();
    }
  }

  async createUser(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        email,
        phoneNumber,
        countryCode = '+91',
        username,
        password,
        role: rawRole,
        status,
        name,
        institutionId,
      } = req.body;

      const role = rawRole ? rawRole.toLowerCase() : rawRole;

      if (role === "instructor" && !name) {
        await session.abortTransaction();
        return sendErrorResponse(res, "Name is required for instructors", 400);
      }

      // Validate institutionId for specific roles
      if (
        ["instructor", "admin", "super-admin"].includes(role) &&
        !institutionId
      ) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "Institution ID is required for this role",
          400
        );
      }

      const existingUserByEmail = await UserService.findByEmail(email);
      if (existingUserByEmail) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "User with this email already exists",
          400
        );
      }
      const existingUserByUsername = await UserService.findByUsername(username);
      if (existingUserByUsername) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "User with this username already exists",
          400
        );
      }
      const existingUserByPhone = await UserService.findByPhone(phoneNumber);
      if (existingUserByPhone) {
        await session.abortTransaction();
        return sendErrorResponse(
          res,
          "User with this phone number already exists",
          400
        );
      }

      const user = await UserService.createUser(
        {
          email,
          phoneNumber,
          countryCode,
          username,
          password,
          role,
          status,
          name, // Include name
          institutionId,
        },
        { session }
      );

      if (!user) {
        await session.abortTransaction();
        return sendErrorResponse(res, "Failed to create user", 500);
      }
      await session.commitTransaction();
      return sendSuccessResponse(res, "User successfully registered", user);
    } catch (error) {
      await session.abortTransaction();
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const errorMessage =
          field === "phoneNumber"
            ? "Phone number already exists"
            : `${field.charAt(0).toUpperCase() + field.slice(1)
            } already exists`;
        return sendErrorResponse(res, errorMessage, 400);
      }
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return sendErrorResponse(res, messages.join(", "), 400);
      }
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    } finally {
      session.endSession();
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email, otpType = 'email' } = req.body;
      if (!email || !String(email).trim()) {
        return sendErrorResponse(res, "Email is required for password reset", 400);
      }
      const emailTrimmed = String(email).trim();
      const user = await UserService.findByEmail(emailTrimmed);
      if (!user) {
        return sendErrorResponse(res, "No account found with this email address", 404);
      }
      // Ensure OTP email can be sent (validate required env)
      if (!process.env.SENDGRID_API_KEY || !process.env.OTP_EMAIL) {
        return sendErrorResponse(
          res,
          "Password reset email is not configured. Please contact support.",
          503
        );
      }
      const effectiveOtpType = otpType === 'password_reset' ? 'email' : otpType;
      const otpCode = await OtpService.generateOtp(effectiveOtpType, emailTrimmed);
      await OtpService.sendOtpEmail(emailTrimmed, otpCode);
      return sendSuccessResponse(res, "OTP sent to your registered email for password reset");
    } catch (error) {
      const status = (error.message && (error.message.includes("Email") || error.message.includes("configured"))) ? 503 : 500;
      return sendErrorResponse(
        res,
        "Failed to send password reset OTP to email. Please try again or contact support.",
        status,
        error.message || error
      );
    }
  }

  async updatePassword(req, res) {
    const { newPassword } = req.body;
    const verifiedToken = req.cookies.verifiedToken;

    if (!verifiedToken) {
      return res
        .status(400)
        .json({ message: "Password reset token is missing" });
    }

    try {
      const decoded = jwt.verify(verifiedToken, process.env.VERIFY_OTP_SECRET);
      const verifiedEmail = decoded.email;
      if (!verifiedEmail) {
        return sendErrorResponse(res, "Invalid reset token", 400);
      }

      const user = await UserService.updatePassword(
        verifiedEmail,
        newPassword
      );
      if (!user) return sendErrorResponse(res, "User not found", 404);

      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("verifiedToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
      });

      return sendSuccessResponse(res, "Password updated successfully");
    } catch (error) {
      if (error.message === "Invalid current password") {
        return sendErrorResponse(res, "Invalid current password", 400);
      }
      return sendErrorResponse(
        res,
        "Failed to update password",
        500,
        error.message || error
      );
    }
  }

  async login(req, res) {
    try {
      await connectDatabase();
      const { emailOrUsername, password } = req.body;
      const user = await UserService.login(emailOrUsername, password);

      if (!user) {
        return sendErrorResponse(res, "Invalid credentials", 400);
      }

      if (!user.isActive) {
        return sendErrorResponse(res, "User account is inactive", 403);
      }

      const institution = await InstitutionService.findById(user.institutionId);

      if (
        !institution ||
        (institution.isActive === false || (institution.status && institution.status !== 'active'))
      ) {
        return sendErrorResponse(res, "User's institution is inactive", 403);
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
          institution: user.institutionId,
          institutionType: institution.institutionType,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
          institution: user.institutionId,
          institutionType: institution.institutionType,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      return sendSuccessResponse(res, "Login successful", {
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    }
  }

  async getInstitutionInfo(req, res) {
    try {
      const userInstitution = req.user.institutionId;
      const institution = await InstitutionService.findById(userInstitution);
      if (
        !institution ||
        (institution.isActive === false || (institution.status && institution.status !== 'active'))
      ) {
        return sendErrorResponse(res, "User's institution is inactive", 403);
      }
      return sendSuccessResponse(res, "Successful", institution);
    } catch (error) {
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    }
  }

  async getUserInfo(req, res) {
    try {

      const id = req.user.id;
      const user = await UserService.findById(id);
      if (!user) {
        return sendErrorResponse(res, "User not found", 403);
      }
      const { password, ...userWithoutPassword } = user.toObject
        ? user.toObject()
        : user;
      return sendSuccessResponse(res, "Successful", userWithoutPassword);
    } catch (error) {
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    }
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return sendErrorResponse(res, "Refresh token not found", 401);
    }
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await UserService.findById(decoded.id); // Fixed userId to id
      if (!user) {
        return sendErrorResponse(res, "Invalid refresh token", 403);
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
          institution: user.institutionId,
          institutionType: decoded.institutionType,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      return sendSuccessResponse(res, "Token refreshed", { accessToken });
    } catch (error) {
      return sendErrorResponse(res, "Invalid or expired refresh token", 403);
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return sendSuccessResponse(res, "Logout successful");
    } catch (error) {
      return sendErrorResponse(
        res,
        "Failed to log out",
        500,
        error.message || error
      );
    }
  }

  async verifyToken(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        valid: false,
        message: "No token provided or incorrect format",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);



      return sendSuccessResponse(res, "Token Verified", {
        valid: true,
        decoded,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        "Invalid or expired token",
        401,
        error.message || error
      );
    }
  }

  async findUser(req, res) {
    try {
      const { username, email, phoneNumber } = req.body;

      let user = null;
      if (username) {
        user = await UserRepository.findByUsername(username);
      } else if (email) {
        user = await UserRepository.findByEmail(email);
      } else if (phoneNumber) {
        user = await UserRepository.findByPhone(phoneNumber);
      } else {
        return sendErrorResponse(res, "Provide username, email, or phoneNumber", 400);
      }

      if (!user) return sendSuccessResponse(res, "User not found", null);

      // Remove password field if it exists
      const userObj = user.toObject ? user.toObject() : user;
      delete userObj.password;

      return sendSuccessResponse(res, "User found", userObj);
    } catch (error) {
      return sendErrorResponse(res, "Error finding user", 500, error.message || error);
    }
  }

  async searchUsers(req, res) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        return sendErrorResponse(res, "Unauthorized or institution context missing", 401);
      }
      const keyword = req.query.q || req.query.keyword || "";
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
      const results = await UserService.searchUsers(keyword, institutionId, limit);
      return sendSuccessResponse(res, "Search results", results);
    } catch (error) {
      return sendErrorResponse(res, "Error searching users", 500, error.message || error);
    }
  }

  async updateUserDetails(req, res) {
    try {
      const { id: userId } = req.user;
      const updateData = req.body;
      // Do not allow role change in self-update
      const { role: _r, ...dataWithoutRole } = updateData;
      const { error, value } = updateUserDataSchema.validate(dataWithoutRole, { abortEarly: false });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(", ");
        return sendErrorResponse(res, errorMessages, 400);
      }

      if (value.username) {
        const findUserByUsername = await UserService.findByUsername(value.username);
        if (findUserByUsername && findUserByUsername._id.toString() !== userId) {
          return sendErrorResponse(res, "Username already taken", 400);
        }
      }
      if (value.phoneNumber) {
        const findByPhoneNumber = await UserService.findByPhone(value.phoneNumber);
        if (findByPhoneNumber && findByPhoneNumber._id.toString() !== userId) {
          return sendErrorResponse(res, "Phone number already in use", 400);
        }
      }

      const updatedUser = await UserService.updateUserData(userId, value);
      return sendSuccessResponse(res, "User details updated successfully", updatedUser);
    } catch (error) {
      return sendErrorResponse(res, "Error updating user details", 500, error.message || error);
    }
  }

  async updateUserByAdmin(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const updateData = req.body;

      const { error, value } = adminUpdateUserSchema.validate(updateData, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(", ");
        return sendErrorResponse(res, errorMessages, 400);
      }

      const targetUser = await UserService.findById(targetUserId);
      if (!targetUser) {
        return sendErrorResponse(res, "User not found", 404);
      }

      if (value.username && value.username !== targetUser.username) {
        const existing = await UserService.findByUsername(value.username);
        if (existing) return sendErrorResponse(res, "Username already taken", 400);
      }
      if (value.phoneNumber && value.phoneNumber !== targetUser.phoneNumber) {
        const existing = await UserService.findByPhone(value.phoneNumber);
        if (existing) return sendErrorResponse(res, "Phone number already in use", 400);
      }

      const updatedUser = await UserService.updateUserData(targetUserId, value);
      return sendSuccessResponse(res, "User updated successfully", updatedUser);
    } catch (error) {
      return sendErrorResponse(res, "Error updating user", 500, error.message || error);
    }
  }

  async uploadProfileImage(req, res) {
    try {
      const { id: userId } = req.user; // Extracting studentId from the request object
      const file = req.file;

      if (!userId) {
        return sendErrorResponse(res, "User ID is required", 400);
      }

      if (!file) {
        return sendErrorResponse(res, "No file uploaded", 400);
      }

      const userExist = await UserService.findById(userId);

      if (!userExist) {
        return sendErrorResponse(res, "User does not exist", 404);
      }

      const fileSize = req.file.size;

      // Validate file type and size
      const allowedMimeTypes = ["image/jpeg", "image/png"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return sendErrorResponse(
          res,
          "Invalid file type. Only JPEG and PNG are allowed.",
          400
        );
      }
      // File size validation (500KB limit)
      if (fileSize > 1024 * 1024) {
        return sendErrorResponse(res, "File size must not exceed 500KB", 400);
      }

      // Upload the image to ImageKit
      const uploadResponse = await imagekit.upload({
        file: file.buffer, // File buffer
        fileName: `profile_${userId}_${Date.now()}`, // File name
        folder: "student_profiles", // Folder in ImageKit
      });


      // Save the image URL in the StudentProfile
      const updateUser = await UserService.updateUserData(
        userId,
        {
          profileUrl: uploadResponse.url,
        }
      );

      return sendSuccessResponse(
        res,
        "Profile image uploaded successfully",
        updateUser
      );

    } catch (error) {
      return sendErrorResponse(
        res,
        "Error uploading profile image",
        500,
        error.message || error
      );
    }
  }

  async uploadCoverImage(req, res) {
    try {
      const { id: userId } = req.user;
      const file = req.file;

      if (!userId) {
        return sendErrorResponse(res, "User ID is required", 400);
      }

      if (!file) {
        return sendErrorResponse(res, "No file uploaded", 400);
      }

      const userExist = await UserService.findById(userId);
      if (!userExist) {
        return sendErrorResponse(res, "User does not exist", 404);
      }

      const fileSize = req.file.size;
      const allowedMimeTypes = ["image/jpeg", "image/png"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return sendErrorResponse(
          res,
          "Invalid file type. Only JPEG and PNG are allowed.",
          400
        );
      }
      if (fileSize > 1024 * 1024) {
        return sendErrorResponse(res, "File size must not exceed 500KB", 400);
      }

      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: `cover_${userId}_${Date.now()}`,
        folder: "student_covers",
      });

      const updatedUser = await UserService.updateUserData(userId, {
        coverUrl: uploadResponse.url,
      });

      return sendSuccessResponse(
        res,
        "Cover image uploaded successfully",
        updatedUser
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        "Error uploading cover image",
        500,
        error.message || error
      );
    }
  }

  async getUsersByRole(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.user?.institution;
      if (!institutionId) {
        return sendErrorResponse(res, "Institution context missing", 401);
      }
      const { role, search, page = 1, limit = 50 } = req.query;
      const filter = { institutionId };
      if (role) filter.role = role.toLowerCase();

      if (search && search.trim()) {
        const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: regex }, { email: regex }, { username: regex }];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const User = require('../models/User');
      const [users, total] = await Promise.all([
        User.find(filter).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }).lean(),
        User.countDocuments(filter)
      ]);

      return sendSuccessResponse(res, "Users fetched", {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      });
    } catch (error) {
      return sendErrorResponse(res, "Error fetching users", 500, error.message);
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (!user) {
        return sendErrorResponse(res, "User not found", 404);
      }
      await User.findByIdAndDelete(userId);
      return sendSuccessResponse(res, "User deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, "Error deleting user", 500, error.message);
    }
  }

  async deleteProfileImage(req, res) {
    try {
      const { id: userId } = req.user;
      if (!userId) {
        return sendErrorResponse(res, "User ID is required", 400);
      }
      const updatedUser = await UserService.updateUserData(userId, { profileUrl: null });
      return sendSuccessResponse(
        res,
        "Profile picture removed successfully",
        updatedUser
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        "Error removing profile picture",
        500,
        error.message || error
      );
    }
  }
}

module.exports = new AuthController();
