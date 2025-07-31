const InstitutionRepository = require('../repositories/InstitutionRepository');
const FeatureRepository = require('../repositories/FeatureRepository');

class FeatureService {

  /**
   * Assign custom features to institution - Simple!
   */
  async assignCustomFeatures(institutionId, featureIds, adminId, limits = null, mode = 'custom') {
    try {
      const institution = await InstitutionRepository.findById(institutionId);
      if (!institution) {
        return { success: false, message: 'Institution not found' };
      }

      // Resolve feature names to ObjectIds if necessary
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
      const newFeatures = featureObjectIds.filter(featureId => !existingFeatureIds.includes(featureId.toString()));

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
      const customFeatures = newFeatures.map(featureId => ({
        featureId,
        isEnabled: true,
        customLimit: null,
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

      const newlyAssignedDetails = newFeatures.map(featureId => ({
        id: featureId,
        name: featureMap[featureId.toString()]
      }));

      return {
        success: true,
        message: `Custom features assigned successfully (${mode} mode)` + (alreadyAssigned.length > 0 ? `, but some were already assigned: ${alreadyAssignedDetails.map(f => f.name).join(', ')}` : ''),
        featuresAssigned: newlyAssignedDetails,
        alreadyAssigned: alreadyAssignedDetails,
        mode: mode
      };

    } catch (error) {
      console.error('Error assigning custom features:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Add custom override to hybrid mode institution
   */
  async addHybridOverride(institutionId, featureId, adminId, isEnabled = true, customLimit = null) {
    try {
      const institution = await InstitutionRepository.findById(institutionId);
      if (!institution) {
        return { success: false, message: 'Institution not found' };
      }

      // Check if feature already exists in custom features
      const existingIndex = institution.customFeatures.findIndex(
        cf => cf.featureId.toString() === featureId
      );

      const override = {
        featureId,
        isEnabled,
        customLimit,
        reason: 'Hybrid mode override',
        assignedBy: adminId,
        assignedAt: new Date()
      };

      if (existingIndex >= 0) {
        // Update existing override
        institution.customFeatures[existingIndex] = override;
      } else {
        // Add new override
        institution.customFeatures.push(override);
      }

      // Set to hybrid mode if not already
      if (institution.featureAccessMode !== 'hybrid') {
        institution.featureAccessMode = 'hybrid';
      }

      await institution.save();

      return {
        success: true,
        message: 'Hybrid override added successfully',
        override: {
          featureId,
          isEnabled,
          customLimit,
          type: existingIndex >= 0 ? 'updated' : 'added'
        }
      };

    } catch (error) {
      console.error('Error adding hybrid override:', error);
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
      await InstitutionRepository.findOneAndUpdate({ _id: institutionId }, {
        featureAccessMode: 'subscription',
        customFeatures: []
      });

      return { success: true, message: 'Switched to subscription mode' };

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