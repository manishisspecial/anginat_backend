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
        return next(); // Don't block request
      }
      
      if (!feature) {
        return next(); // Don't block request
      }
      
      // Increment usage asynchronously (don't wait for completion)
      AccessControlService.incrementUsage(institutionId, feature._id)
        .catch(() => {});
      
      // Continue with request immediately
      next();
      
    } catch (error) {
      next(); // Never block request for tracking errors
    }
  };
};

module.exports = { trackUsage };