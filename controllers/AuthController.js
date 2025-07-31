const UserService = require("../services/UserService");
const InstitutionService = require("../services/InstitutionService");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const OtpService = require("../services/OtpService");
const UserRepository = require("../repositories/UserRepository");
const imagekit = require("../utils/imageKit");

class AuthController {
  async register(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        email,
        phoneNumber,
        username,
        password,
        role,
        status,
        name, // Added name
        institutionData,
      } = req.body;

      // Validate name for instructors
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
      console.error("Registration Error:", {
        message: error.message || error,
        stack: error.stack,
      });
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
        username,
        password,
        role,
        status,
        name,
        institutionId,
      } = req.body;

      // Validate name for instructors
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
      console.error("Registration Error:", {
        message: error.message || error,
        stack: error.stack,
      });
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
      const { email, otpType } = req.body;
      const user = await UserService.findByEmail(email);
      if (!user) return sendErrorResponse(res, "User not found", 404);
      const otpCode = await OtpService.generateOtp(otpType, email);
      await OtpService.sendOtpEmail(email, otpCode);
      return sendSuccessResponse(res, "OTP sent to email for password reset");
    } catch (error) {
      return sendErrorResponse(
        res,
        "Failed to send OTP for password reset",
        500,
        error.message || error
      );
    }
  }

  async updatePassword(req, res) {
    const { email, newPassword } = req.body;
    const verifiedToken = req.cookies.verifiedToken;
    console.log("Verified Token:", verifiedToken);

    if (!verifiedToken) {
      return res
        .status(400)
        .json({ message: "Password reset token is missing" });
    }

    try {

      const decoded = jwt.verify(verifiedToken, process.env.VERIFY_OTP_SECRET);

      const user = await UserService.updatePassword(
        email,
        newPassword
      );
      if (!user) return sendErrorResponse(res, "User not found", 404);

      res.clearCookie("verifiedToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
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
      const { emailOrUsername, password } = req.body;
      const user = await UserService.login(emailOrUsername, password);
      if (!user) {
        return sendErrorResponse(res, "Invalid credentials", 400);
      }
      console.log("Console User:", user.isActive);

      if (!user.isActive) {
        return sendErrorResponse(res, "User account is inactive", 403);
      }

      console.log("Console User:", user.institutionId);
      const institution = await InstitutionService.findById(user.institutionId);
      console.log("Console Institution:", institution);

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
      console.error("Login Error:", error);
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
      console.log("Console Institution:", institution);
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
      console.log("Decoded User:", decoded);

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
      console.log("Refresh Token Error:", error);
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
      console.error(error);
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
      console.error("Error occurred while finding user:", error);
      return sendErrorResponse(res, "Error finding user", 500, error.message || error);
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
      console.error("Error uploading profile image:", error); // Log the error
      return sendErrorResponse(
        res,
        "Error uploading profile image",
        500,
        error.message || error
      );
    }
  }
}

module.exports = new AuthController();
