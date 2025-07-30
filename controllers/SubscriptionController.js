const FeatureRepository = require("../repositories/FeatureRepository");
const InstitutionRepository = require("../repositories/InstitutionRepository");
const SubscriptionPlanRepository = require("../repositories/SubscriptionPlanRepository");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

class SubscriptionController {
    async getAllSubscriptionPlans(req, res) {
        try {
            const plans = await SubscriptionPlanRepository.getAllSubscriptionPlans(['features.featureId'])

            sendSuccessResponse(res, 'Subscription plans fetched successfully', plans);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async getSubscriptionPlanById(req, res) {
        try {
            const { id } = req.params;
            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(id, ['features.featureId']);

            if (!plan) {
                return sendErrorResponse(res, "Subscription plan not found", 404);
            }

            sendSuccessResponse(res, 'Subscription plan fetched successfully', plan);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async createSubscriptionPlan(req, res) {
        try {
            const {
                name,
                displayName,
                description,
                pricing,
                limits,
                features = [],
                isActive = true,
                sortOrder = 0
            } = req.body;

            // Check if plan with same name already exists
            const existingPlan = await SubscriptionPlan.findOne({ name });
            if (existingPlan) {
                return res.status(400).json({
                    success: false,
                    message: 'Subscription plan with this name already exists'
                });
            }

            // Validate feature IDs if provided
            if (features.length > 0) {
                const featureIds = features.map(f => f.featureId);
                const validFeatures = await FeatureRepository.getFeatures({ _id: { $in: featureIds } });

                if (validFeatures.length !== featureIds.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Some feature IDs are invalid'
                    });
                }
            }

            const plan = new SubscriptionPlanRepository.createSubscriptionPlan({
                name,
                displayName,
                description,
                pricing,
                limits,
                features,
                isActive,
                sortOrder
            });


            sendSuccessResponse(res, 'Subscription plan created successfully', plan);

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

    async updateSubscriptionPlan(req, res) {
        try {
            const planId = req.params.id;
            const updateData = req.body;

            // Remove _id and __v from update data
            delete updateData._id;
            delete updateData.__v;

            // Validate feature IDs if provided
            if (updateData.features && updateData.features.length > 0) {
                const featureIds = updateData.features.map(f => f.featureId);
                const validFeatures = await FeatureRepository.getFeatures({ _id: { $in: featureIds } });

                if (validFeatures.length !== featureIds.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Some feature IDs are invalid'
                    });
                }
            }

            const plan = await SubscriptionPlanRepository.updateSubscriptionPlan(
                planId,
                updateData,
                { new: true, runValidators: true }
            )

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }

            res.json({
                success: true,
                data: plan,
                message: 'Subscription plan updated successfully'
            });

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

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteSubscriptionPlan(req, res) {
        try {
            const { id } = req.params;
            const deletedPlan = await SubscriptionPlanRepository.deleteSubscriptionPlan(id);

            if (!deletedPlan) {
                return sendErrorResponse(res, "Subscription plan not found", 404);
            }

            sendSuccessResponse(res, 'Subscription plan deleted successfully', deletedPlan);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async addFeatureToSubscriptionPlan(req, res) {
        try {
            const planId = req.params.id;
            const { featureId, isEnabled = true, usageLimit = null, resetCycle = 'monthly' } = req.body;

            // Validate feature exists
            const feature = await FeatureRepository.getFeatureById(featureId);
            if (!feature) {
                return res.status(400).json({
                    success: false,
                    message: 'Feature not found'
                });
            }

            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }

            // Check if feature already exists in plan
            const existingFeature = plan.features.find(
                f => f.featureId.toString() === featureId.toString()
            );

            if (existingFeature) {
                return res.status(400).json({
                    success: false,
                    message: 'Feature already exists in this plan'
                });
            }

            // Add feature to plan
            plan.features.push({
                featureId,
                isEnabled,
                usageLimit,
                resetCycle
            });

            await plan.save();
            await plan.populate('features.featureId');

            sendSuccessResponse(res, 'Feature added to subscription plan successfully', plan);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async removeFeatureFromSubscriptionPlan(req, res) {
        try {
            const { id: planId, featureId } = req.params;

            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId, ['features.featureId']);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }

            // Remove feature from plan
            plan.features = plan.features.filter(
                f => f.featureId.toString() !== featureId.toString()
            );

            await plan.save();

            sendSuccessResponse(res, 'Feature removed from subscription plan successfully', plan);

        } catch (error) {
            sendErrorResponse(res, 'Internal Server Error', error.message || error)
        }
    }

    async updateFeatureInSubscriptionPlan(req, res) {
        try {
            const { id: planId, featureId } = req.params;
            const { isEnabled, usageLimit, resetCycle } = req.body;

            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId, ['features.featureId']);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }

            // Find and update feature in plan
            const featureIndex = plan.features.findIndex(
                f => f.featureId.toString() === featureId.toString()
            );

            if (featureIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Feature not found in this plan'
                });
            }

            // Update feature properties
            if (isEnabled !== undefined) plan.features[featureIndex].isEnabled = isEnabled;
            if (usageLimit !== undefined) plan.features[featureIndex].usageLimit = usageLimit;
            if (resetCycle !== undefined) plan.features[featureIndex].resetCycle = resetCycle;

            await plan.save();
            sendSuccessResponse(res, 'Feature updated in subscription plan successfully', plan);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async assignSubscriptionPlanToInstitution(req, res) {
        try {
            const institutionId = req.params.id;
            const { planId, status = 'active', endsAt } = req.body;

            // Validate subscription plan exists
            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId);
            if (!plan) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subscription plan ID'
                });
            }

            const institution = await InstitutionRepository.findById(institutionId);
            if (!institution) {
                return res.status(404).json({
                    success: false,
                    message: 'Institution not found'
                });
            }

            // Update subscription
            institution.subscription = {
                planId,
                status,
                startsAt: new Date(),
                endsAt: endsAt ? new Date(endsAt) : null,
                autoRenew: true
            };

            // Clear custom features when assigning subscription plan
            institution.customFeatures = [];
            institution.hybridOverrides = [];
            institution.accessMode = 'subscription';

            await institution.save();
            await institution.populate('subscription.planId');

            sendSuccessResponse(res, 'Subscription plan assigned to institution successfully', institution);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }

    async updateInstitutionSubscriptionStatus(req, res) {
        try {
            const institutionId = req.params.id;
            const { status, endsAt } = req.body;

            const validStatuses = ['active', 'cancelled', 'expired', 'trial', 'suspended'];
            if (!validStatuses.includes(status)) {
                return sendErrorResponse(res, "Invalid subscription status", 400);
            }

            const updateData = {
                'subscription.status': status
            };

            if (endsAt) {
                updateData['subscription.endsAt'] = new Date(endsAt);
            }

            const institution = await InstitutionRepository.updateInstituteDetails(
                institutionId,
                updateData
            )

            await institution.populate('subscription.planId');

            if (!institution) {
                return sendErrorResponse(res, "Institution not found", 404);
            }

            sendSuccessResponse(res, 'Subscription status updated successfully', institution);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }


    async updateInstitutionUsage(req, res) {
        try {
            const institutionId = req.params.id;
            const usage = req.body;

            const institution = await InstitutionRepository.updateInstituteDetails(
                institutionId,
                { usage },
                { new: true }
            );

            await institution.populate('subscription.planId');

            if (!institution) {
                return sendErrorResponse(res, "Institution not found", 404);
            }

            sendSuccessResponse(res, 'Institution usage updated successfully', institution);

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }
}

module.exports = new SubscriptionController();