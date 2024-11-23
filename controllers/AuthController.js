const UserService = require('../services/UserService');
const InstitutionService = require('../services/InstitutionService');
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const OtpService = require("../services/OtpService");

class AuthController {
    async register(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { email, phoneNumber, username, password, role,status, institutionData } = req.body;
            const existingUserByEmail = await UserService.findByEmail(email);
            if (existingUserByEmail) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'User with this email already exists.', 400);
            }
            const existingUserByUsername = await UserService.findByUsername(username);
            if (existingUserByUsername) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'User with this username already exists.', 400);
            }
            const existingInstitutionByDomain = await InstitutionService.findByDomain(institutionData.domainName);
            if (existingInstitutionByDomain) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'Institution with this username already exists.', 400);
            }
            const existingInstitutionByEmail = await InstitutionService.findByInstitutionEmail(institutionData.email);
            if (existingInstitutionByEmail) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'Institution with this email already exists.', 400);
            }

            const existingUserByPhone = await UserService.findByPhone(phoneNumber);
            if (existingUserByPhone) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'User with this phone already exists.', 400);
            }

            const institution = await InstitutionService.findOrCreateInstitution(
                institutionData,
                { session }
            );

            if (!institution) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'Failed to create institution.', 500);
            }
            const user = await UserService.createUser({
                email,
                phoneNumber,
                username,
                password,
                role,
                status,
                institutionId: institution._id
            }, { session });

            if (!user) {
                await session.abortTransaction();
                return sendErrorResponse(res, 'Failed to create user.', 500);
            }
            await session.commitTransaction();

            return sendSuccessResponse(res, 'User and institution registered successfully.', {
                userId: user._id,
                institutionId: institution._id
            });

        } catch (error) {
            await session.abortTransaction();

            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                const errorMessage = field === 'phoneNumber'
                    ? 'Phone number already exists.'
                    : `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
                return sendErrorResponse(res, errorMessage, 400);
            }
            console.error("Registration Error:", {
                message: error.message || error,
                stack: error.stack
            });
            return sendErrorResponse(res, 'Internal Server Error', 500, error.message || error);
        } finally {
            session.endSession();
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email,otpType } = req.body;
            const user = await UserService.findByEmail(email);
            if (!user) return sendErrorResponse(res, 'User not found', 404);
            const otpCode = await OtpService.generateOtp(otpType,email);
            await OtpService.sendOtpEmail(email, otpCode);
            return sendSuccessResponse(res, 'OTP sent to email for password reset');
        } catch (error) {
            return sendErrorResponse(res, 'Failed to send OTP for password reset', 500, error.message || error);
        }
    }
    async updatePassword(req, res) {
        try {
            const { email, newPassword } = req.body;
            const user = await UserService.updatePassword(email, newPassword);
            if (!user) return sendErrorResponse(res, 'User not found', 404);
            return sendSuccessResponse(res, 'Password updated successfully');
        } catch (error) {
            return sendErrorResponse(res, 'Failed to update password', 500, error.message || error);
        }
    }
    async login(req, res) {
        try {
            const { emailOrUsername, password } = req.body;
            const user = await UserService.login(emailOrUsername, password);
            if (!user) {
                return sendErrorResponse(res, 'Invalid credentials', 400);
            }
            if (user.status !== 'active') {
                return sendErrorResponse(res, 'User account is inactive', 403);
            }
            const institution = await InstitutionService.findById(user.institutionId);
            if (!institution || institution.status !== 'active') {
                return sendErrorResponse(res, 'User\'s institution is inactive', 403);
            }
            const accessToken = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                    institution: user.institutionId
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            // Generate Refresh Token
            const refreshToken = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                    institution: user.institutionId
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });



            return sendSuccessResponse(res, 'Login successful', { accessToken,refreshToken });
        } catch (error) {
            return sendErrorResponse(res, 'Internal Server Error', 500, error.message || error);
        }
    }
    async getInstitutionInfo(req, res) {
        try {
            const userInstitution = req.user.institution;
            const institution = await InstitutionService.findById(userInstitution);
            if (!institution || institution.status !== 'active') {
                return sendErrorResponse(res, 'User\'s institution is inactive', 403);
            }
            return sendSuccessResponse(res, 'successful', institution);
        } catch (error) {
            return sendErrorResponse(res, 'Internal Server Error', 500, error.message || error);
        }
    }
    async getUserInfo(req, res) {
        try {
            const id = req.user.id;
            const user = await UserService.findById(id);
            if (!user) {
                return sendErrorResponse(res, 'User Not found', 403);
            }
            const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
            return sendSuccessResponse(res, 'successful', userWithoutPassword);
        } catch (error) {
            return sendErrorResponse(res, 'Internal Server Error', 500, error.message || error);
        }
    }
    async refreshToken(req, res) {
        const { refreshToken } = req.cookies;
        console.log(req.cookies);
        if (!refreshToken) {
            return sendErrorResponse(res, 'Refresh token not found', 401);
        }
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await UserService.findById(decoded.userId);

            if (!user) {
                return sendErrorResponse(res, 'Invalid refresh token', 403);
            }
            const accessToken = jwt.sign(
                { userId: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
            return sendSuccessResponse(res, 'Token refreshed', { accessToken });
        } catch (error) {
            return sendErrorResponse(res, 'Invalid or expired refresh token', 403);
        }
    }
    async logout(req, res) {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return sendSuccessResponse(res, 'Logout successful');
        } catch (error) {
            return sendErrorResponse(res, 'Failed to log out', 500, error.message || error);
        }
    }
}

module.exports = new AuthController();