// routes/admin/user-permissions.js
const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const { requirePermission } = require('../middlewares/permission');
const { verifyToken } = require('../middlewares/authMiddleware');



/**
 * Get user permissions
 */
router.get('/:userId',
    verifyToken,
    requirePermission('read_users'),
    PermissionController.getUserPermissions
);

/**
 * Grant feature access to user
 */
router.post('/:userId/features',
    verifyToken,
    requirePermission('update_users'),
    PermissionController.assignFeatureToUser
);

/**
 * Revoke feature access from user
 */
router.delete('/:userId/features/:featureId',
    verifyToken,
    requirePermission('update_users'),
    PermissionController.revokeFeatureAccess
);

/**
 * Add custom permission to user
 */
router.post('/:userId/permissions',
    verifyToken,
    requirePermission('update_users'),
    PermissionController.addPermissionToUser
);

/**
 * Remove custom permission from user
 */
router.delete('/:userId/permissions/:permission',
    verifyToken,
    requirePermission('update_users'),
    PermissionController.removePermissionFromUser
);

module.exports = router;