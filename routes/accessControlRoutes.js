// access-control-service/routes/accessControl.js
const express = require('express');
const router = express.Router();
const { authenticateServiceToken } = require('../middlewares/authMiddleware');
const AccessControlService = require('../services/AccessControlService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const InstitutionRepository = require('../repositories/InstitutionRepository');


// Middleware to authenticate inter-service requests
router.use(authenticateServiceToken);

// Check feature access
router.post('/check-feature', async (req, res) => {
    try {
        const { institutionId, featureName, userId = null } = req.body;

        if (!institutionId || !featureName) {
            return res.status(400).json({
                success: false,
                message: 'institutionId and featureName are required'
            });
        }

        const result = await AccessControlService.checkFeatureAccess(
            institutionId,
            featureName
        );

        sendSuccessResponse(res, 'Feature access checked successfully', {
            hasAccess: result.hasAccess,
            reason: usageCheck.withinLimit ? 'Custom access granted' : 'Usage limit exceeded',
            accessMode: 'custom',
            usageInfo: usageCheck,
        });

    } catch (error) {
        console.error('Check feature access error:', error);
        sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
    }
});

// Check user permission
router.post('/check-permission', async (req, res) => {
    try {
        const { userId, permission } = req.body;

        if (!userId || !permission) {
            return res.status(400).json({
                success: false,
                message: 'userId and permission are required'
            });
        }

        const result = await AccessControlService.checkUserPermission(
            userId,
            permission
        );
        sendSuccessResponse(res, 'User permission checked successfully', {
            hasPermission: result.hasPermission,
            reason: result.reason,
        });

    } catch (error) {
        console.error('Check permission error:', error);
        sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
    }
});

// Combined check (feature + permission)
router.post('/check-access', async (req, res) => {
    try {
        const { institutionId, userId, featureName, permission } = req.body;

        if (!institutionId || !userId || !featureName || !permission) {
            return res.status(400).json({
                success: false,
                message: 'All fields (institutionId, userId, featureName, permission) are required'
            });
        }

        // Check feature access
        const featureResult = await AccessControlService.checkFeatureAccess(
            institutionId,
            featureName
        );

        if (!featureResult.hasAccess) {
            return sendSuccessResponse(res, 'Feature access checked successfully', {

                hasAccess: false,
                reason: featureResult.reason,
                type: 'feature',
                featureName,
                upgradeRequired: featureResult.reason === 'Feature not included in current plan'

            });
        }


        // Check user permission
        const permissionResult = await AccessControlService.checkUserPermission(
            userId,
            permission
        );

        if (!permissionResult.hasPermission) {

            return sendSuccessResponse(res, 'Permission access checked successfully', {


                hasAccess: false,
                reason: permissionResult.reason,
                type: 'permission',
                permission,
                upgradeRequired: false

            });
        }

        sendSuccessResponse(res, 'Access check successful', {

            hasAccess: true,
            reason: 'Access granted',
            featureInfo: featureResult,
            permissionInfo: permissionResult

        });

    } catch (error) {
        console.error('Check access error:', error);
        sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
    }
});

// Track usage
router.post('/track-usage', async (req, res) => {
    try {
        const { institutionId, featureName } = req.body;

        if (!institutionId || !featureName) {
            return res.status(400).json({
                success: false,
                message: 'institutionId and featureName are required'
            });
        }

        const result = await AccessControlService.incrementUsage(
            institutionId,
            featureName
        );

        sendSuccessResponse(res, 'Usage tracked successfully', result);

    } catch (error) {
        console.error('Track usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get accessible features for institution
router.get('/features/:institutionId', async (req, res) => {
    try {
        const { institutionId } = req.params;

        const features = await AccessControlService.getAccessibleFeatures(institutionId);

        sendSuccessResponse(res, 'Accessible features retrieved successfully', features);

    } catch (error) {
        console.error('Get features error:', error);
        sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
    }
});

// Get subscription info
router.get('/subscription/:institutionId', async (req, res) => {
    try {
        const { institutionId } = req.params;

        const Institution = require('../models/Institution');
        const institution = await InstitutionRepository.findById(institutionId, ['subscription.planId'])

        if (!institution) {
            return res.status(404).json({
                success: false,
                message: 'Institution not found'
            });
        }

        sendSuccessResponse(res, 'Subscription info retrieved successfully', {

            subscription: institution.subscription,
            usage: institution.usage

        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;