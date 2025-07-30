// middleware/usageTracking.js
const AccessControlService = require('../services/AccessControlService');
const Feature = require('../models/Feature');

/**
 * Middleware to track feature usage
 */
const trackUsage = (featureName) => {
  return async (req, res, next) => {
    try {
      // Validate required data
      if (!req.user || !req.user.institutionId) {
        return next(); // Don't block request, just skip tracking
      }
      
      const institutionId = req.user.institutionId;
      
      // Get feature ID
      let feature;
      try {
        feature = await Feature.findOne({ name: featureName })
          .select('_id name')
          .lean();
      } catch (error) {
        console.error('Error finding feature for tracking:', error);
        return next(); // Don't block request
      }
      
      if (!feature) {
        console.warn(`Feature not found for tracking: ${featureName}`);
        return next(); // Don't block request
      }
      
      // Increment usage asynchronously (don't wait for completion)
      AccessControlService.incrementUsage(institutionId, feature._id)
        .catch(error => {
          console.error('Error tracking usage:', {
            error: error.message,
            featureName,
            institutionId,
            featureId: feature._id
          });
        });
      
      // Continue with request immediately
      next();
      
    } catch (error) {
      console.error('Usage tracking middleware error:', error);
      next(); // Never block request for tracking errors
    }
  };
};

module.exports = { trackUsage };