const FeatureRepository = require("../repositories/FeatureRepository");
const InstitutionRepository = require("../repositories/InstitutionRepository");
const UserRepository = require("../repositories/UserRepository");


class FeatureAccessService {

    async checkFeatureAccess(institutionId, featureName) {
        try {
            // Get institution with subscription details
            const institution = await InstitutionRepository.findById(institutionId)


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
            console.error('Error checking feature access:', error);
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

    /**
     * Check if user has permission for specific action
     * @param {String} userId - User ID
     * @param {String} permission - Permission to check
     * @returns {Object} - Permission result
     */
    async checkUserPermission(userId, permission) {
        try {
            const user = await UserRepository.findById(userId)

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
            const rolePermissions = this.getRolePermissions(user.role);

            // Check custom permissions
            const hasCustomPermission = user.permissions.includes(permission);
            const hasRolePermission = rolePermissions.includes(permission);

            if (hasCustomPermission || hasRolePermission) {
                return {
                    hasPermission: true,
                    source: hasCustomPermission ? 'custom' : 'role'
                };
            }

            return {
                hasPermission: false,
                reason: 'Permission not granted'
            };

        } catch (error) {
            console.error('Error checking user permission:', error);
            return {
                hasPermission: false,
                reason: 'Internal error'
            };
        }
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
      console.error('Error getting accessible features:', error);
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
            if (limit === null || limit === undefined) {
                return {
                    withinLimit: true,
                    currentUsage: 0,
                    limit: 'unlimited'
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
            console.error('Error checking usage limit:', error);
            return {
                withinLimit: false,
                currentUsage: 0,
                limit: 0
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
                'read_students', 'create_students', 'update_students', 'delete_students',
                'read_teachers', 'create_teachers', 'update_teachers', 'delete_teachers',
                'read_classes', 'create_classes', 'update_classes', 'delete_classes',
                'read_subjects', 'create_subjects', 'update_subjects', 'delete_subjects',
                'read_timetable', 'create_timetable', 'update_timetable', 'delete_timetable',
                'read_attendance', 'create_attendance', 'update_attendance', 'delete_attendance',
                'read_announcements', 'create_announcements', 'update_announcements', 'delete_announcements',
                'read_media', 'create_media', 'update_media', 'delete_media',
                'read_leads', 'create_leads', 'update_leads', 'delete_leads',
                'read_reports', 'create_reports'
            ],
            teacher: [
                'read_students', 'read_classes', 'read_subjects',
                'read_timetable', 'create_attendance', 'update_attendance',
                'read_announcements', 'create_announcements',
                'read_media', 'create_media',
                'read_reports'
            ],
            student: [
                'read_timetable', 'read_announcements', 'read_media'
            ],
            staff: [
                'read_students', 'read_teachers', 'read_classes',
                'read_leads', 'create_leads', 'update_leads'
            ],
            parent: [
                'read_announcements', 'read_media'
            ]
        };

        return rolePermissions[role] || [];
    }

}