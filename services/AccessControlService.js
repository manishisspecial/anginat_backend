const FeatureRepository = require("../repositories/FeatureRepository");
const InstitutionRepository = require("../repositories/InstitutionRepository");
const UserRepository = require("../repositories/UserRepository");


class FeatureAccessService {

    async checkFeatureAccess(institutionId, featureName) {
        try {
            // Get institution with subscription details
            const institution = await InstitutionRepository.findById(institutionId, [
                'subscription.planId',
                'customFeatures.featureId'
            ])


            if (!institution) {
                return {
                    hasAccess: false,
                    reason: 'Institution not found'
                };
            }

            // Check subscription status
            if (!this.isSubscriptionActive(institution.subscription)) {
                return {
                    hasAccess: false,
                    reason: 'Subscription inactive or expired'
                };
            }

            // Get feature details
            const feature = await FeatureRepository.getFeature({ name: featureName })
            if (!feature) {
                return {
                    hasAccess: false,
                    reason: 'Feature not found'
                };
            }

            // Core features are always available
            if (feature.isCore) {
                return {
                    hasAccess: true,
                    reason: 'Core feature - always available'
                };
            }

            // Check based on access mode
            if (institution.featureAccessMode === 'custom') {
                return this.checkCustomFeatureAccess(institution, feature);
            } else if (institution.featureAccessMode === 'hybrid') {
                return this.checkHybridFeatureAccess(institution, feature);
            } else {
                return this.checkSubscriptionFeatureAccess(institution, feature);
            }

        } catch (error) {
            return {
                hasAccess: false,
                reason: 'Internal error'
            };
        }
    }

    /**
  * Check custom feature access
  */
    async checkCustomFeatureAccess(institution, feature) {
        const customFeature = institution.customFeatures.find(
            cf => cf.featureId._id.toString() === feature._id.toString()
        );

        if (!customFeature || !customFeature.isEnabled) {
            return {
                hasAccess: false,
                reason: 'Feature not assigned to this institution',
                accessMode: 'custom'
            };
        }

        // Check usage limits
        const usageCheck = await this.checkUsageLimit(
            institution._id,
            feature._id,
            customFeature.customLimit
        );

        return {
            hasAccess: usageCheck.withinLimit,
            reason: usageCheck.withinLimit ? 'Custom access granted' : 'Usage limit exceeded',
            accessMode: 'custom',
            usageInfo: usageCheck,
            assignedBy: customFeature.assignedBy,
            assignedAt: customFeature.assignedAt
        };
    }

    /**
     * Check hybrid feature access (subscription + custom overrides)
     */
    async checkHybridFeatureAccess(institution, feature) {
        // First check if there's a custom override
        const customFeature = institution.customFeatures.find(
            cf => cf.featureId._id.toString() === feature._id.toString()
        );

        if (customFeature) {
            // Custom override exists - use it
            if (!customFeature.isEnabled) {
                return {
                    hasAccess: false,
                    reason: 'Feature disabled by custom override',
                    accessMode: 'hybrid-custom'
                };
            }

            // Check custom usage limits
            const usageCheck = await this.checkUsageLimit(
                institution._id,
                feature._id,
                customFeature.customLimit
            );

            return {
                hasAccess: usageCheck.withinLimit,
                reason: usageCheck.withinLimit ? 'Hybrid access (custom override)' : 'Custom usage limit exceeded',
                accessMode: 'hybrid-custom',
                usageInfo: usageCheck,
                customOverride: customFeature
            };
        }

        // No custom override - fall back to subscription
        const subscriptionResult = await this.checkSubscriptionFeatureAccess(institution, feature);

        if (subscriptionResult.hasAccess) {
            subscriptionResult.accessMode = 'hybrid-subscription';
            subscriptionResult.reason = 'Hybrid access (subscription)';
        }

        return subscriptionResult;
    }

    /**
     * Check subscription feature access (existing logic)
     */
    async checkSubscriptionFeatureAccess(institution, feature) {
        if (!this.isSubscriptionActive(institution.subscription)) {
            return {
                hasAccess: false,
                reason: 'Subscription inactive',
                accessMode: 'subscription'
            };
        }

        const plan = institution.subscription.planId;
        const planFeature = plan.features.find(
            f => f.featureId.toString() === feature._id.toString()
        );

        if (!planFeature || !planFeature.isEnabled) {
            return {
                hasAccess: false,
                reason: 'Feature not in subscription plan',
                accessMode: 'subscription'
            };
        }

        const usageCheck = await this.checkUsageLimit(
            institution._id,
            feature._id,
            planFeature.usageLimit
        );

        return {
            hasAccess: usageCheck.withinLimit,
            reason: usageCheck.withinLimit ? 'Subscription access granted' : 'Usage limit exceeded',
            accessMode: 'subscription',
            usageInfo: usageCheck
        };
    }




    isSubscriptionActive(subscription) {
        if (!subscription) return false;

        const now = new Date();

        // Check subscription status
        if (subscription.status === 'cancelled' ||
            subscription.status === 'expired' ||
            subscription.status === 'suspended') {
            return false;
        }

        // Check trial expiry
        if (subscription.status === 'trial' &&
            subscription.trialEndsAt &&
            subscription.trialEndsAt < now) {
            return false;
        }

        // Check subscription expiry
        if (subscription.endsAt && subscription.endsAt < now) {
            return false;
        }

        return true;
    }

    /**
       * Get all accessible features
       */
    async getAccessibleFeatures(institutionId) {
        try {

            const institution = await InstitutionRepository.findById(institutionId)

            if (!institution) return [];

            const allFeatures = await Feature.find({}).lean();
            const accessibleFeatures = [];

            for (const feature of allFeatures) {
                const accessResult = await this.checkFeatureAccess(institutionId, feature.name);

                if (accessResult.hasAccess) {
                    accessibleFeatures.push({
                        ...feature,
                        accessMode: accessResult.accessMode,
                        usageInfo: accessResult.usageInfo
                    });
                }
            }

            return accessibleFeatures;

        } catch (error) {
            return [];
        }
    }


    /**
   * Check usage limit for a feature
   * @param {String} institutionId - Institution ID
   * @param {String} featureId - Feature ID
   * @param {Number} limit - Usage limit
   * @returns {Object} - Usage check result
   */
    async checkUsageLimit(institutionId, featureId, limit) {
        try {
            if (limit === null || limit === undefined || limit === 0) {
                return {
                    withinLimit: true,
                    currentUsage: 0,
                    limit: 'unlimited',
                    limitType: 'none'
                };
            }

            const institution = await InstitutionRepository.findById(institutionId);

            const featureUsage = institution.featureUsage.find(
                usage => usage.featureId.toString() === featureId.toString()
            );

            const currentUsage = featureUsage ? featureUsage.usageCount : 0;

            return {
                withinLimit: currentUsage < limit,
                currentUsage,
                limit,
                remainingUsage: Math.max(0, limit - currentUsage)
            };

        } catch (error) {
            return {
                withinLimit: false,
                currentUsage: 0,
                limit: 0
            };
        }
    }

    /**
   * Increment usage count for a feature
   * @param {String} institutionId - Institution ID
   * @param {String} featureId - Feature ID
   * @returns {Boolean} - Success status
   */
    async incrementUsage(institutionId, featureId) {
        try {
            // Validate inputs
            if (!institutionId || !featureId) {
                return false;
            }

            // Try to update existing feature usage record
            const updateResult = await InstitutionRepository.findOneAndUpdate(
                {
                    _id: institutionId,
                    'featureUsage.featureId': featureId
                },
                {
                    $inc: { 'featureUsage.$.usageCount': 1 },
                    $set: { 'featureUsage.$.lastUsedAt': new Date() }
                },
                { new: true }
            );

            // If no existing record found, create new one
            if (!updateResult) {
                await InstitutionRepository.findOneAndUpdate(
                    {
                        _id: institutionId,
                        'featureUsage.featureId': { $ne: featureId }
                    },
                    {
                        $push: {
                            featureUsage: {
                                featureId,
                                usageCount: 1,
                                lastUsedAt: new Date()
                            }
                        }
                    }
                );
            }

            return true;

        } catch (error) {
            return false;
        }
    }

    /**
    * Check if user has permission for specific action
    * @param {String} userId - User ID
    * @param {String} permission - Permission to check
    * @returns {Object} - Permission result
    */
    async checkUserPermission(userId, permission, featureId = null) {
        try {
            const user = await UserRepository.findById(userId, [
                'institutionId'
            ])

            if (!user) {
                return {
                    hasPermission: false,
                    reason: 'User not found'
                };
            }

            // Check if user is active
            if (!user.isActive) {
                return {
                    hasPermission: false,
                    reason: 'User account inactive'
                };
            }

            // Check role-based permissions
            // 1. Check role-based permissions (base permissions)
            const rolePermissions = this.getRolePermissions(user.role);
            if (rolePermissions.includes(permission)) {
                return {
                    hasPermission: true,
                    source: 'role',
                    reason: 'Role-based permission'
                };
            }

            // Check custom permissions
            // 2. Check custom permissions (additional permissions beyond role)
            const customPermissions = user.customPermissions || [];
            const hasCustomPermission = customPermissions.some(cp => cp.permission === permission);

            if (hasCustomPermission) {
                return {
                    hasPermission: true,
                    source: 'custom',
                    reason: 'Custom permission granted'
                };
            }

            // 3. If feature-specific, check allowed features
            if (featureId) {
                const allowedFeature = user.allowedFeatures?.find(
                    af => af.featureId.toString() === featureId.toString()
                );

                if (allowedFeature && allowedFeature.permissions.includes(permission)) {
                    return {
                        hasPermission: true,
                        source: 'feature',
                        reason: 'Feature-specific permission'
                    };
                }
            }

            return {
                hasPermission: false,
                reason: 'Permission not granted'
            };

        } catch (error) {
            return {
                hasPermission: false,
                reason: 'Internal error'
            };
        }
    }


    /**
  * Check combined feature access and user permission
  * @param {String} userId - User ID
  * @param {String} featureName - Feature name
  * @param {String} permission - Required permission
  * @returns {Object} - Combined access result
  */
    async checkFeatureAndPermission(userId, featureName, permission) {
        try {
            const user = await UserRepository.findById(userId, [
                'institutionId',
            ]);
            if (!user) {
                return {
                    hasAccess: false,
                    reason: 'User not found'
                };
            }

            // Check feature access first
            const featureAccess = await this.checkFeatureAccess(user.institutionId, featureName);
            if (!featureAccess.hasAccess) {
                return {
                    hasAccess: false,
                    reason: featureAccess.reason,
                    level: 'feature'
                };
            }

            // Check user permission
            const permissionCheck = await this.checkUserPermission(userId, permission);
            if (!permissionCheck.hasPermission) {
                return {
                    hasAccess: false,
                    reason: permissionCheck.reason,
                    level: 'permission',
                    featureAccess: featureAccess
                };
            }

            return {
                hasAccess: true,
                reason: 'Full access granted',
                featureAccess: featureAccess,
                permissionAccess: permissionCheck
            };

        } catch (error) {
            return {
                hasAccess: false,
                reason: 'Internal error'
            };
        }
    }

    /**
  * Get all user permissions (role + custom + feature-specific)
  * @param {String} userId - User ID
  * @returns {Object} - Comprehensive permissions object
  */
    async getUserPermissions(userId) {
        try {
            const user = await UserRepository.findById(userId, [
                'allowedFeatures.featureId',
            ])

            if (!user) {
                return {
                    all: [],
                    role: [],
                    custom: [],
                    features: {}
                };
            }

            // Get role-based permissions
            const rolePermissions = this.getRolePermissions(user.role);

            // Get custom permissions
            const customPermissions = (user.customPermissions || []).map(cp => cp.permission);

            // Get feature-specific permissions
            const featurePermissions = {};
            if (user.allowedFeatures) {
                user.allowedFeatures.forEach(af => {
                    if (af.featureId && af.featureId.name) {
                        featurePermissions[af.featureId.name] = af.permissions;
                    }
                });
            }

            // Combine all permissions
            const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];

            return {
                all: allPermissions,
                role: rolePermissions,
                custom: customPermissions,
                features: featurePermissions,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };

        } catch (error) {
            return {
                all: [],
                role: [],
                custom: [],
                features: {}
            };
        }
    }

    /**
   * Get all accessible features for an institution
   * @param {String} institutionId - Institution ID
   * @returns {Array} - List of accessible features
   */
    async getAccessibleFeatures(institutionId) {
        try {
            const institution = await InstitutionRepository.findById(institutionId, [
                'subscription.planId',
                'customFeatures.featureId'
            ]);

            if (!institution) {
                return [];
            }

            const allFeatures = await FeatureRepository.getAllFeatures();
            const accessibleFeatures = [];

            for (const feature of allFeatures) {
                const accessResult = await this.checkFeatureAccess(institutionId, feature.name);

                if (accessResult.hasAccess) {
                    accessibleFeatures.push({
                        ...feature,
                        accessMode: accessResult.accessMode,
                        usageInfo: accessResult.usageInfo
                    });
                }
            }

            return accessibleFeatures;

        } catch (error) {
            return [];
        }
    }

    /**
   * Grant feature access to user (Whitelist Approach)
   * @param {String} userId - User ID
   * @param {String} featureId - Feature ID
   * @param {Array} permissions - Permissions to grant for this feature
   * @param {String} reason - Reason for granting access
   * @param {String} grantedBy - Admin user ID
   * @returns {Object} - Result
   */
    async grantFeatureAccess(userId, featureId, permissions = [], reason = 'Manual grant', grantedBy = null) {
        try {
            const user = await UserRepository.findById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Validate feature exists
            const feature = await FeatureRepository.getFeatureById(featureId);
            if (!feature) {
                return { success: false, message: 'Feature not found' };
            }

            // Check if user already has access to this feature
            const existingIndex = user.allowedFeatures.findIndex(
                af => af.featureId.toString() === featureId
            );

            const featureAccess = {
                featureId,
                permissions: permissions.length > 0 ? permissions : ['read'],
                reason,
                grantedBy,
                grantedAt: new Date()
            };

            if (existingIndex >= 0) {
                // Update existing access
                user.allowedFeatures[existingIndex] = featureAccess;
            } else {
                // Add new access
                user.allowedFeatures.push(featureAccess);
            }

            await user.save();

            return {
                success: true,
                message: 'Feature access granted successfully',
                featureAccess
            };

        } catch (error) {
            return {
                success: false,
                message: 'Internal error'
            };
        }
    }

    /**
   * Revoke feature access from user
   * @param {String} userId - User ID
   * @param {String} featureId - Feature ID
   * @returns {Object} - Result
   */
    async revokeFeatureAccess(userId, featureId) {
        try {
            const result = await UserRepository.updateUserData(
                userId,
                {
                    $pull: {
                        allowedFeatures: { featureId: featureId }
                    }
                },
                { new: true }
            );

            if (!result) {
                return { success: false, message: 'User not found' };
            }

            return {
                success: true,
                message: 'Feature access revoked successfully'
            };

        } catch (error) {
            return {
                success: false,
                message: 'Internal error'
            };
        }
    }

    /**
   * Add custom permission to user (beyond role defaults)
   * @param {String} userId - User ID
   * @param {String} permission - Permission to add
   * @param {String} reason - Reason for adding permission
   * @param {String} grantedBy - Admin user ID
   * @returns {Object} - Result
   */
    async addUserPermission(userId, permission, reason = 'Manual grant', grantedBy = null) {
        try {
            const user = await UserRepository.findById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Check if permission already exists
            const existingPermission = user.customPermissions.find(cp => cp.permission === permission);

            if (existingPermission) {
                return { success: false, message: 'Permission already exists' };
            }

            // Add new custom permission
            user.customPermissions.push({
                permission,
                reason,
                grantedBy,
                grantedAt: new Date()
            });

            await user.save();

            return {
                success: true,
                message: 'Permission added successfully'
            };

        } catch (error) {
            return {
                success: false,
                message: 'Internal error'
            };
        }
    }

    /**
   * Remove custom permission from user
   * @param {String} userId - User ID
   * @param {String} permission - Permission to remove
   * @returns {Object} - Result
   */
    async removeUserPermission(userId, permission) {
        try {
            const result = await UserRepository.updateUserData(
                userId,
                {
                    $pull: {
                        customPermissions: { permission: permission }
                    }
                },
                { new: true }
            );

            if (!result) {
                return { success: false, message: 'User not found' };
            }

            return {
                success: true,
                message: 'Permission removed successfully'
            };

        } catch (error) {
            return {
                success: false,
                message: 'Internal error'
            };
        }
    }

    /**
    * Get default permissions for a role
    * @param {String} role - User role
    * @returns {Array} - Array of permissions
    */
    getRolePermissions(role) {
    const rolePermissions = {
      admin: [
        // Student Management
        'read_students', 'create_students', 'update_students', 'delete_students',
        // Teacher Management
        'read_teachers', 'create_teachers', 'update_teachers', 'delete_teachers',
        // Class Management
        'read_classes', 'create_classes', 'update_classes', 'delete_classes',
        // Subject Management
        'read_subjects', 'create_subjects', 'update_subjects', 'delete_subjects',
        // Timetable Management
        'read_timetable', 'create_timetable', 'update_timetable', 'delete_timetable',
        // Attendance Management
        'read_attendance', 'create_attendance', 'update_attendance', 'delete_attendance',
        // Announcement Management
        'read_announcements', 'create_announcements', 'update_announcements', 'delete_announcements',
        // Media Management
        'read_media', 'create_media', 'update_media', 'delete_media',
        // Lead Management
        'read_leads', 'create_leads', 'update_leads', 'delete_leads',
        // Report Management
        'read_reports', 'create_reports', 'export_reports',
        // Settings Management
        'read_settings', 'update_settings',
        // User Management
        'read_users', 'create_users', 'update_users', 'delete_users',
        // Institution Management
        'read_institution', 'update_institution',
        // Custom Features (for admin panel)
        'read_custom_features', 'manage_custom_features', 'manage_institutions',
        // Library Management
        'read_library', 'create_library', 'update_library', 'delete_library',
        // Hostel Management
        'read_hostel', 'create_hostel', 'update_hostel', 'delete_hostel',
        // Course Management
        'read_courses', 'create_courses', 'update_courses', 'delete_courses',
        // Transport Management
        'read_transport', 'create_transport', 'update_transport', 'delete_transport'
      ],
      teacher: [
        // Student related (limited)
        'read_students', 'update_students',
        // Class related
        'read_classes', 'read_subjects',
        // Timetable
        'read_timetable',
        // Attendance
        'read_attendance', 'create_attendance', 'update_attendance',
        // Announcements
        'read_announcements', 'create_announcements',
        // Media
        'read_media', 'create_media',
        // Reports (limited)
        'read_reports',
        // Basic settings
        'read_settings'
      ],
      student: [
        // Read-only access mostly
        'read_timetable',
        'read_announcements', 
        'read_media',
        'read_settings',
        'read_courses' // For online institutes
      ],
      staff: [
        // Administrative staff permissions
        'read_students', 'create_students', 'update_students',
        'read_teachers',
        'read_classes', 'read_subjects',
        // Lead management (admission staff)
        'read_leads', 'create_leads', 'update_leads',
        // Basic announcements
        'read_announcements', 'create_announcements',
        // Media access
        'read_media', 'create_media',
        // Reports
        'read_reports',
        // Settings
        'read_settings',
        // Library (if library staff)
        'read_library',
        // Transport (if transport staff)
        'read_transport'
      ],
      parent: [
        // Very limited access
        'read_announcements',
        'read_media',
        'read_settings'
      ]
    };
    
    return rolePermissions[role] || [];
  }

}

module.exports = new FeatureAccessService();