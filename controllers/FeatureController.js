const FeatureRepository = require("../repositories/FeatureRepository");
const FeatureService = require("../services/FeatureService");
const { sendErrorResponse, sendSuccessResponse } = require("../utils/response");

class FeatureController {

    async createFeature(req, res) {
        try {
            const {
                name,
                displayName,
                description,
                module,
                requiredPermissions = [],
                isCore = false,
                isToggleable = true,
                commonForTypes = ['school', 'college', 'online_institute'],
                sortOrder
            } = req.body;

            // Check if feature with same name already exists
            const existingFeature = await FeatureRepository.getFeature({ name });
            if (existingFeature) {
                return res.status(400).json({
                    success: false,
                    message: 'Feature with this name already exists'
                });
            }

            const feature = await FeatureRepository.createFeature({
                name,
                displayName,
                description,
                module,
                requiredPermissions,
                isCore,
                isToggleable,
                commonForTypes,
                sortOrder
            });

            return sendSuccessResponse(res, 'Feature created successfully', feature);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: Object.keys(error.errors).map(key => ({
                        field: key,
                        message: error.errors[key].message
                    }))
                });
            }
            console.error('Error creating feature:', error);
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async createBulkFeatures(req, res) {
        try {
            const { features } = req.body;

            if (!Array.isArray(features)) {
                return res.status(400).json({
                    success: false,
                    message: 'Features must be an array'
                });
            }

            const createdFeatures = await FeatureRepository.createBulkFeatures(features);

            sendSuccessResponse(res, 'Features created successfully', createdFeatures);

        } catch (error) {
            if (error.name === 'ValidationError' || error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation or duplicate error',
                    error: error.message
                });
            }

            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async updateFeature(req, res) {
        try {
            const featureId = req.params.id;
            const updateData = req.body;

            // Remove _id and __v from update data
            delete updateData._id;
            delete updateData.__v;

            const feature = await FeatureRepository.updateFeature(
                featureId,
                updateData
            );

            if (!feature) {
                return res.status(404).json({
                    success: false,
                    message: 'Feature not found'
                });
            }
            sendSuccessResponse(res, 'Feature updated successfully', feature);

        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: Object.keys(error.errors).map(key => ({
                        field: key,
                        message: error.errors[key].message
                    }))
                });
            }

            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async deleteFeature(req, res) {
        try {
            const feature = await FeatureRepository.deleteFeature(req.params.id);

            if (!feature) {
                return res.status(404).json({
                    success: false,
                    message: 'Feature not found'
                });
            }

            res.json({
                success: true,
                message: 'Feature deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getAllFeatures(req, res) {
        try {
            // Extract `fields` from query parameters
            const { fields } = req.query;

            // Convert `fields` into an array (e.g., 'name,displayName' -> ['name', 'displayName'])
            const selectFields = fields ? fields.split(',') : [];

            // Pass the `selectFields` array to the repository method
            const allFeatures = await FeatureRepository.getAllFeatures(selectFields);

            // Group features based on `commonForTypes`
            const groupedFeatures = {
                school: allFeatures.filter(f => f.commonForTypes?.includes('school')),
                college: allFeatures.filter(f => f.commonForTypes?.includes('college')),
                online_institute: allFeatures.filter(f => f.commonForTypes?.includes('institute')),
                all: allFeatures
            };

            // Send the response
            res.json({
                success: true,
                data: groupedFeatures
            });

        } catch (error) {
            console.error('Error fetching features:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async assignCustomFeatures(req, res) {
        try {
            const { institutionId, featureIds, limits, mode = 'custom', reason } = req.body;
            const superAdminId = req.body.superAdminId || 'temp-admin'; // temporary

            const result = await FeatureService.assignCustomFeatures(
                institutionId,
                featureIds,
                superAdminId,
                limits,
                mode,
                reason
            );

            sendSuccessResponse(res, 'Features assigned successfully', result);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async addHybridOverride(req, res) {
        try {
            const { institutionId, featureId, isEnabled = true, customLimit, reason } = req.body;
            const superAdminId = req.body.superAdminId || 'temp-admin'; // temporary

            const result = await FeatureService.addHybridOverride(
                institutionId,
                featureId,
                superAdminId,
                isEnabled,
                customLimit,
                reason
            );

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteHybridOverride(req, res) {
        try {
            const { institutionId, featureId } = req.params;
            const { reason } = req.body;
            const superAdminId = req.body.superAdminId || 'temp-admin'; // temporary

            const result = await CustomFeatureService.removeHybridOverride(
                institutionId,
                featureId,
                superAdminId,
                reason
            );

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async addFeatureToInstitution(req, res) {
        try {
            const { institutionId, featureId, customLimit } = req.body;
            const superAdminId = req.body.superAdminId || 'temp-admin'; // temporary

            const result = await CustomFeatureService.addFeatureToInstitution(
                institutionId,
                featureId,
                superAdminId,
                customLimit
            );

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async switchToSubscriptionMode(req, res) {
        try {
            const { institutionId } = req.body;

            const result = await CustomFeatureService.switchToSubscriptionMode(institutionId);

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    
}

module.exports = new FeatureController();