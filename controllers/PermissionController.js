const { selectFields } = require("express-validator/lib/field-selection");
const { populate } = require("../models/Feature");
const UserRepository = require("../repositories/UserRepository");
const AccessControlService = require("../services/AccessControlService");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

class PermissionController {
    async getUserPermissions(req, res) {
        try {
            const { userId } = req.params;

            const user = await UserRepository.findById(userId, [], ['email', 'name', 'role', 'allowedFeatures', 'customPermissions']);
            await user.populate('allowedFeatures.featureId', 'name displayName');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const allPermissions = await AccessControlService.getUserPermissions(userId);


            sendSuccessResponse(res, 'User permissions retrieved successfully', {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                permissions: allPermissions,
                allowedFeatures: user.allowedFeatures,
                customPermissions: user.customPermissions
            });

        } catch (error) {
            console.error('Error getting user permissions:', error);
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }

    }

    async assignFeatureToUser(req, res) {
        try {
            const { userId } = req.params;
            const { featureId, permissions, reason } = req.body;
            const grantedBy = req.user.id;

            const result = await AccessControlService.grantFeatureAccess(
                userId,
                featureId,
                permissions,
                reason,
                grantedBy
            );

            sendSuccessResponse(res, 'Feature access granted successfully', result);
        } catch (error) {
            console.error('Error granting feature access:', error);
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async revokeFeatureAccess(req, res) {
        try {
            const { userId, featureId } = req.params;

            const result = await AccessControlService.revokeFeatureAccess(userId, featureId);

            sendSuccessResponse(res, 'Feature access revoked successfully', result);
        } catch (error) {
            console.error('Error revoking feature access:', error);
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async addPermissionToUser(req, res) {
        try {
            const { userId } = req.params;
            const { permission, reason } = req.body;
            const grantedBy = req.user.id;

            const result = await AccessControlService.addUserPermission(
                userId,
                permission,
                reason,
                grantedBy
            );

            sendSuccessResponse(res, 'Permission added successfully', result);

        } catch (error) {
            console.error('Error adding user permission:', error);
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async removePermissionFromUser(req, res) {
              try {
            const { userId, permission } = req.params;

            const result = await AccessControlService.removeUserPermission(userId, permission);

            sendSuccessResponse(res, 'Permission removed successfully', result);

        } catch (error) {
            console.error('Error removing user permission:', error);
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }
}

module.exports = new PermissionController();