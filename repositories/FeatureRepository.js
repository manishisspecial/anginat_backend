const Feature = require("../models/Feature");

class FeatureRepository {
    async createFeature(featureData) {
        try {
            const feature = new Feature(featureData);
            return await feature.save();
        } catch (error) {
            throw new Error(`Error creating feature: ${error.message}`);
        }
    }

    async updateFeature(featureId, updateData) {
        try {
            const updatedFeature = await Feature.findOneAndUpdate(
                { _id: featureId },
                updateData,
                { new: true }
            );
            return updatedFeature;
        } catch (error) {
            throw new Error(`Error updating feature: ${error.message}`);
        }
    }

    async getFeature(options) {
        try {
            const feature = await Feature.findOne(options).lean();
            if (!feature) {
                throw new Error('Feature not found');
            }
            return feature;
        } catch (error) {
            throw new Error(`Error fetching feature: ${error.message}`);
        }
    }

    async getFeatureById(featureId) {
        try {
            const feature = await Feature.findById(featureId);
            if (!feature) {
                throw new Error('Feature not found');
            }
            return feature;
        } catch (error) {
            throw new Error(`Error fetching feature: ${error.message}`);
        }
    }

    async getAllFeatures() {
        try {
            const features = await Feature.find().lean();
            return features;
        } catch (error) {
            throw new Error(`Error fetching features: ${error.message}`);
        }
    }
}

module.exports = new FeatureRepository();