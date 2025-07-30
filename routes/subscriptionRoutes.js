// routes/admin/subscription-plans.js
const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');

// No authentication for now - will add super-admin auth later

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
router.post('/', SubscriptionController.createSubscriptionPlan);

/**
 * Update subscription plan
 */
router.put('/:id', SubscriptionController.updateSubscriptionPlan);

/**
 * Delete subscription plan
 */
router.delete('/:id', SubscriptionController.deleteSubscriptionPlan);

/**
 * Add feature to subscription plan
 */
router.post('/:id/features', SubscriptionController.addFeatureToSubscriptionPlan);

/**
 * Remove feature from subscription plan
 */
router.delete('/:id/features/:featureId', SubscriptionController.removeFeatureFromSubscriptionPlan);

/**
 * Update feature in subscription plan
 */
router.put('/:id/features/:featureId', SubscriptionController.updateFeatureInSubscriptionPlan);


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