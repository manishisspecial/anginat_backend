const FeatureRepository = require("../repositories/FeatureRepository");
const InstitutionRepository = require("../repositories/InstitutionRepository");
const SubscriptionPlanRepository = require("../repositories/SubscriptionPlanRepository");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

class SubscriptionController {
    async getAllSubscriptionPlans(req, res) {
        try {
            const plans = await SubscriptionPlanRepository.getAllSubscriptionPlans(['features.featureId'])

            const totalPlans = plans.length;

            return sendSuccessResponse(res, 'Subscription plans fetched successfully', {
                totalPlans,
                plans
            });

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
            const existingPlan = await SubscriptionPlanRepository.getSubscriptionPlan({ name });
            if (existingPlan) {
                return res.status(400).json({
                    success: false,
                    message: 'Subscription plan with this name already exists'
                });
            }

            // Validate feature IDs if provided
            if (features.length > 0) {
                const featureIds = features.map(f => f.featureId);
                const validFeatures = await FeatureRepository.validateFeatureIds(featureIds);

                if (validFeatures.length !== featureIds.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Some feature IDs are invalid'
                    });
                }
            }

            const plan = await SubscriptionPlanRepository.createSubscriptionPlan({
                name,
                displayName,
                description,
                pricing,
                limits,
                features,
                isActive,
                sortOrder
            });


            return sendSuccessResponse(res, 'Subscription plan created successfully', plan);

        } catch (error) {
            console.log("Error creatinng subscription plan :", error);
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

            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }

            // Handle pricing update
            if (updateData.pricing && Array.isArray(updateData.pricing)) {
                const existingPricing = plan.pricing || [];
                const newPricing = updateData.pricing;

                // Merge new pricing with existing pricing
                newPricing.forEach(newPrice => {
                    const isDuplicate = existingPricing.some(existingPrice => JSON.stringify(existingPrice) === JSON.stringify(newPrice));
                    if (!isDuplicate) {
                        existingPricing.push(newPrice);
                    }
                });

                plan.pricing = existingPricing;
            }

            // Update other data
            Object.keys(updateData).forEach(key => {
                if (key !== 'pricing') {
                    plan[key] = updateData[key];
                }
            });

            await plan.save();

            return sendSuccessResponse(res, 'Subscription plan updated successfully', plan);
        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
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

    async addFeaturesToSubscriptionPlan(req, res) {
        try {
            const planId = req.params.id;
            const { features } = req.body;

            if (!features || features.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No features provided'
                });
            }

            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            }

            // Validate feature IDs
            const featureIds = features.map(f => f.featureId);
            const validFeatures = await FeatureRepository.validateFeatureIds(featureIds);

            if (validFeatures.length !== featureIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some feature IDs are invalid'
                });
            }

            const alreadyAssignedFeatures = [];
            const newlyAssignedFeatures = [];

            featureIds.forEach(featureId => {
                const existingFeature = plan.features.find(f => f.featureId.toString() === featureId.toString());
                if (existingFeature) {
                    alreadyAssignedFeatures.push(existingFeature.featureId);
                } else {
                    const userFeature = features.find(f => f.featureId.toString() === featureId.toString());
                    newlyAssignedFeatures.push({
                        featureId,
                        isEnabled: userFeature.isEnabled !== undefined ? userFeature.isEnabled : true,
                        usageLimit: userFeature.usageLimit !== undefined ? userFeature.usageLimit : null,
                        resetCycle: userFeature.resetCycle !== undefined ? userFeature.resetCycle : 'never'
                    });
                }
            });

            // Add new features to the plan
            plan.features.push(...newlyAssignedFeatures);

            await plan.save();
            await plan.populate('features.featureId');

            return sendSuccessResponse(res, 'Features added to subscription plan successfully', {
                alreadyAssignedFeatures,
                newlyAssignedFeatures,
            });

        } catch (error) {
            sendErrorResponse(res, "Internal Server Error", 500, error.message || error);
        }
    }


    async removeFeaturesFromSubscriptionPlan(req, res) {
        try {
            const { id: planId } = req.params;
            const { featureIds } = req.body;

            if (!featureIds || featureIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No feature IDs provided'
                });
            }

            const plan = await SubscriptionPlanRepository.getSubscriptionPlanById(planId,['features.featureId']);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found'
                });
            } 

            // Remove features from plan
            plan.features = plan.features.filter(
                f => !featureIds.includes(f.featureId.toString())
            );

            await plan.save();

            sendSuccessResponse(res, 'Features removed from subscription plan successfully', plan);
        } catch (error) {
            console.log("Error removing features from subscription plan:", error);
            sendErrorResponse(res, 'Internal Server Error', error.message || error);
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

            const validStatuses = ['active', 'cancelled', 'expired', 'suspended'];
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