const AccessControlService = require("../services/AccessControlService");

/**
 * Middleware to check feature access only
 */
const requireFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            // Validate user authentication
            if (!req.user || !req.user.institutionId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            const institutionId = req.user.institutionId;
            
            // Check feature access
            const accessResult = await AccessControlService.checkFeatureAccess(
                institutionId,
                featureName
            );

            if (!accessResult.hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Feature access denied',
                    reason: accessResult.reason,
                    featureName,
                    accessMode: accessResult.accessMode,
                    upgradeRequired: accessResult.reason.includes('subscription plan'),
                    code: 'FEATURE_ACCESS_DENIED'
                });
            }

            // Store access info in request for later use
            req.featureAccess = accessResult;

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    };
};

module.exports = {
    requireFeature
}