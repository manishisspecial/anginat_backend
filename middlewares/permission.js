// middleware/permission.js
const AccessControlService = require('../services/AccessControlService');
const { requireFeature } = require('./featureAccess');

/**
 * Middleware to check user permissions only
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Validate user authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }
      
      const userId = req.user.id;
      
      // Check user permission
      const permissionResult = await AccessControlService.checkUserPermission(
        userId, 
        permission
      );
      
      if (!permissionResult.hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied',
          reason: permissionResult.reason,
          requiredPermission: permission,
          userRole: req.user.role,
          code: 'PERMISSION_DENIED'
        });
      }
      
      // Store permission info in request
      req.userPermission = permissionResult;
      
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

/**
 * Combined middleware for feature and permission check (more efficient)
 */
const requireFeatureWithPermission = (featureName, permission) => {
  return async (req, res, next) => {
    try {
      // Validate user authentication
      if (!req.user || !req.user.id || !req.user.institutionId) {
        return res.status(401).json({
          success: false,
          message: 'Full authentication required',
          code: 'FULL_AUTH_REQUIRED'
        });
      }
      
      const userId = req.user.id;
      
      // Check both feature access and permission in one efficient call
      const accessResult = await AccessControlService.checkFeatureAndPermission(
        userId, 
        featureName, 
        permission
      );
      
      if (!accessResult.hasAccess) {
        const statusCode = 403;
        const isFeatureIssue = accessResult.level === 'feature';
        
        return res.status(statusCode).json({
          success: false,
          message: isFeatureIssue ? 'Feature access denied' : 'Permission denied',
          reason: accessResult.reason,
          level: accessResult.level,
          featureName,
          requiredPermission: permission,
          accessMode: accessResult.featureAccess?.accessMode,
          upgradeRequired: isFeatureIssue && accessResult.reason.includes('subscription plan'),
          code: isFeatureIssue ? 'FEATURE_ACCESS_DENIED' : 'PERMISSION_DENIED'
        });
      }
      
      // Store access info in request
      req.featureAccess = accessResult.featureAccess;
      req.userPermission = accessResult.permissionAccess;
      
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

/**
 * Array-based middleware for sequential checking
 */
const requireFeatureAndPermission = (featureName, permission) => {

  return [
    requireFeature(featureName),
    requirePermission(permission)
  ];
};

module.exports = { 
  requirePermission, 
  requireFeatureAndPermission,
  requireFeatureWithPermission
};