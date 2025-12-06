const InstitutionRepository = require('../repositories/InstitutionRepository');
const FeatureRepository = require('../repositories/FeatureRepository');
const SubscriptionPlanRepository = require('../repositories/SubscriptionPlanRepository');

class FeatureService {

  /**
   * Assign custom features to institution - Simple!
   */
  async assignCustomFeatures(institutionId, featureConfigs, adminId, mode = 'custom') {
    try {
      const institution = await InstitutionRepository.findById(institutionId);
      if (!institution) {
        return { success: false, message: 'Institution not found' };
      }

      // Resolve feature names to ObjectIds if necessary
      const featureIds = featureConfigs.map(config => config.featureId);
      const features = await FeatureRepository.getFeatures({ _id: { $in: featureIds } });
      if (features.length !== featureIds.length) {
        return { success: false, message: 'Some features not found' };
      }

      const featureMap = features.reduce((map, feature) => {
        map[feature._id.toString()] = feature.name;
        return map;
      }, {});

      const featureObjectIds = features.map(feature => feature._id);

      // Filter out already assigned features
      const existingFeatureIds = institution.customFeatures.map(cf => cf.featureId.toString());
      const alreadyAssigned = featureObjectIds.filter(featureId => existingFeatureIds.includes(featureId.toString()));
      const newFeatures = featureConfigs.filter(config => !existingFeatureIds.includes(config.featureId.toString()));

      // Notify if some features are already assigned
      const alreadyAssignedDetails = alreadyAssigned.map(featureId => ({
        id: featureId,
        name: featureMap[featureId.toString()]
      }));

      if (alreadyAssigned.length > 0) {
        console.log(`The following features are already assigned: ${alreadyAssignedDetails.map(f => f.name).join(', ')}`);
      }

      if (newFeatures.length === 0) {
        return { success: false, message: 'All features are already assigned', alreadyAssigned: alreadyAssignedDetails };
      }

      // Create new custom features array
      const customFeatures = newFeatures.map(config => ({
        featureId: config.featureId,
        isEnabled: true, // Always true
        customLimit: config.customLimit ?? null, // Default to null
        resetCycle: config.customLimit === null ? 'never' : (config.resetCycle ?? 'monthly'), // Default resetCycle logic
        reason: mode === 'hybrid' ? 'Hybrid mode override' : 'Admin assignment',
        assignedBy: adminId,
        assignedAt: new Date()
      }));

      // Add new features to existing custom features
      institution.customFeatures.push(...customFeatures);

      // Update feature access mode if necessary
      if (institution.featureAccessMode !== mode) {
        institution.featureAccessMode = mode;
      }

      await institution.save();

      const newlyAssignedDetails = newFeatures.map(config => ({
        id: config.featureId,
        name: featureMap[config.featureId.toString()]
      }));

      return {
        success: true,
        message: `${mode === 'hybrid' ? 'Hybrid override added' : 'Custom features assigned'} successfully` + (alreadyAssigned.length > 0 ? `, but some were already assigned: ${alreadyAssignedDetails.map(f => f.name).join(', ')}` : ''),
        featuresAssigned: newlyAssignedDetails,
        alreadyAssigned: alreadyAssignedDetails,
        mode
      };

    } catch (error) {
      console.error(`Error ${mode === 'hybrid' ? 'adding hybrid override' : 'assigning custom features'}:`, error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Remove hybrid override (feature will fall back to subscription)
   */
  async removeHybridOverride(institutionId, featureId) {
    try {
      await InstitutionRepository.findOneAndUpdate({ _id: institutionId }, {
        $pull: { customFeatures: { featureId } }
      });

      return {
        success: true,
        message: 'Hybrid override removed (will use subscription setting)'
      };

    } catch (error) {
      console.error('Error removing hybrid override:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Add single feature to institution
   */
  async addFeatureToInstitution(institutionId, featureId, adminId, customLimit = null) {
    try {
      const institution = await InstitutionRepository.findById(institutionId);
      if (!institution) {
        return { success: false, message: 'Institution not found' };
      }

      // Check if feature already exists
      const existingIndex = institution.customFeatures.findIndex(
        cf => cf.featureId.toString() === featureId
      );

      const newFeature = {
        featureId,
        isEnabled: true,
        customLimit,
        reason: 'Admin added',
        assignedBy: adminId,
        assignedAt: new Date()
      };

      if (existingIndex >= 0) {
        // Update existing
        institution.customFeatures[existingIndex] = newFeature;
      } else {
        // Add new
        institution.customFeatures.push(newFeature);
      }

      if (institution.featureAccessMode === 'subscription') {
        institution.featureAccessMode = 'custom';
      }

      await institution.save();

      return { success: true, message: 'Feature added successfully' };

    } catch (error) {
      console.error('Error adding feature:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Remove feature from institution
   */
  async removeFeatureFromInstitution(institutionId, featureId) {
    try {
      await InstitutionRepository.findOneAndUpdate({ _id: institutionId }, {
        $pull: { customFeatures: { featureId } }
      });

      return { success: true, message: 'Feature removed successfully' };

    } catch (error) {
      console.error('Error removing feature:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Switch institution back to subscription mode
   */
  async switchToSubscriptionMode(institutionId) {
    try {
      const institution = await InstitutionRepository.findById(institutionId);
      if (!institution) {
        return { success: false, message: 'Institution not found' };
      }

      const subscriptionPlanId = institution.subscription?.planId;
      if (!subscriptionPlanId) {
        return { success: false, message: 'No subscription plan assigned to the institution' };
      }

      // Fetch subscription plan features
      const subscriptionPlan = await SubscriptionPlanRepository.findById(subscriptionPlanId);
      if (!subscriptionPlan || !subscriptionPlan.features) {
        return { success: false, message: 'Invalid or missing subscription plan features' };
      }

      // Assign subscription plan features
      institution.customFeatures = subscriptionPlan.features.map(feature => ({
        featureId: feature._id,
        isEnabled: true,
        customLimit: null, // Default to unlimited
        resetCycle: 'never', // Default reset cycle for subscription features
        reason: 'Subscription plan feature',
        assignedBy: null, // No specific admin for subscription features
        assignedAt: new Date()
      }));

      institution.featureAccessMode = 'subscription';

      await institution.save();

      return { success: true, message: 'Switched to subscription mode with subscription plan features assigned' };

    } catch (error) {
      console.error('Error switching mode:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Get features commonly used by institute type
   */
  async getCommonFeatures(instituteType) {
    try {
      const features = await FeatureRepository.getFeatures({
        commonForTypes: instituteType
      });

      return features;

    } catch (error) {
      console.error('Error getting common features:', error);
      return [];
    }
  }

  /**
   * Get institution's current configuration
   */
  async getInstitutionConfig(institutionId) {
    try {
      const institution = await InstitutionRepository.findById(institutionId, [
        'customFeatures.featureId',
        'customFeatures.assignedBy'
      ])

      if (!institution) {
        return { success: false, message: 'Institution not found' };
      }

      return {
        success: true,
        data: {
          featureAccessMode: institution.featureAccessMode,
          customFeatures: institution.customFeatures,
          customLimits: institution.customLimits,
          usage: institution.usage,
          featureUsage: institution.featureUsage
        }
      };

    } catch (error) {
      console.error('Error getting institution config:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Reset usage tracking when switching modes
   */
  async resetUsageTracking(institutionId) {
    try {
      await InstitutionRepository.updateInstituteDetails(institutionId, {
        $set: {
          'featureUsage.$[].usageCount': 0,
          'featureUsage.$[].lastUsedAt': new Date()
        }
      });
    } catch (error) {
      console.error('Error resetting usage tracking:', error);
    }
  }
}

module.exports = new FeatureService();