// routes/admin/subscription-plans.js
const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');


const { createSubscriptionValidation, updateSubscriptionValidation, addFeaturesValidation, removeFeatureFromInstitutionValidation, updateFeatureValidation, removeFeatureValidation } = require('../validations/SubscriptionValidation');
const { validateInput } = require('../middlewares/inputValidation');


/**
 * Get all subscription plans
 */
router.get('/', SubscriptionController.getAllSubscriptionPlans);

/**
 * Get single subscription plan by ID
 */
router.get('/:id', SubscriptionController.getSubscriptionPlanById);

/**
 * Create new subscription plan
 */
router.post('/', validateInput(createSubscriptionValidation), SubscriptionController.createSubscriptionPlan);

/**
 * Update subscription plan
 */
router.put('/:id',validateInput(updateSubscriptionValidation), SubscriptionController.updateSubscriptionPlan);

/**
 * Delete subscription plan
 */
router.delete('/:id', SubscriptionController.deleteSubscriptionPlan);

/**
 * Add feature to subscription plan
 */
router.post('/:id/features',validateInput(addFeaturesValidation), SubscriptionController.addFeaturesToSubscriptionPlan);

/**
 * Remove feature from subscription plan
 */
router.delete('/:id/features',validateInput(removeFeatureValidation), SubscriptionController.removeFeaturesFromSubscriptionPlan);

/**
 * Update feature in subscription plan
 */
router.put('/:id/features/:featureId',validateInput(updateFeatureValidation), SubscriptionController.updateFeatureInSubscriptionPlan);

/** 
 * * Assign subscription plan to institution
 */
router.post('/:id/assign-plan', SubscriptionController.assignSubscriptionPlanToInstitution);

/**
 * Update institution subscription status
 */
router.put('/:id/subscription-status', SubscriptionController.updateInstitutionSubscriptionStatus);

/**
 * Update institution usage
 */
router.put('/:id/usage', SubscriptionController.updateInstitutionUsage);

module.exports = router;