// routes/admin/custom-features.js
const express = require('express');
const router = express.Router();
const FeatureController = require('../controllers/FeatureController');

// No authentication for now - will add super-admin auth later

/**
 * Create new feature
 */
router.post('/', FeatureController.createFeature);

/**
 * Update feature
 */
router.put('/:id', FeatureController.updateFeature);

/**
 * Delete feature
 */
router.delete('/:id', FeatureController.deleteFeature);

/**
 * Bulk create features
 */
router.post('/bulk', FeatureController.createBulkFeatures);

/**
 * Get all features grouped by institute type
 */
router.get('/get-all', FeatureController.getAllFeatures);

/**
 * Assign custom features to institution
 */
router.post('/assign', FeatureController.assignCustomFeatures);

/**
 * Add hybrid override to institution
 */
router.post('/hybrid-override', FeatureController.addHybridOverride);

/**
 * Remove hybrid override
 */
router.delete('/hybrid-override/:institutionId/:featureId', FeatureController.deleteHybridOverride);

/**
 * Add single feature to institution
 */
router.post('/add-feature', FeatureController.addFeatureToInstitution);

/**
 * Switch institution to subscription mode
 */
router.post('/switch-to-subscription', FeatureController.switchToSubscriptionMode);

/**
 * Get institution configuration
 */
// router.get('/:institutionId/config', async (req, res) => {
//   try {
//     const { institutionId } = req.params;

//     const result = await CustomFeatureService.getInstitutionConfig(institutionId);

//     res.json(result);

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

module.exports = router;