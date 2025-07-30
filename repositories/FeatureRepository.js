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

    async createBulkFeatures(featuresData) {
        try {
            const features = await Feature.insertMany(featuresData);
            return features;
        } catch (error) {
            throw new Error(`Error creating bulk features: ${error.message}`);
        }
    }

    async updateFeature(featureId, updateData) {
        try {
            const updatedFeature = await Feature.findOneAndUpdate(
                { _id: featureId },
                updateData,
                { new: true , runValidators: true }
            );
            return updatedFeature;
        } catch (error) {
            throw new Error(`Error updating feature: ${error.message}`);
        }
    }

    async deleteFeature(featureId) {
        try {
            const deletedFeature = await Feature.findByIdAndDelete(featureId);
            if (!deletedFeature) {
                throw new Error('Feature not found');
            }
            return deletedFeature;
        } catch (error) {
            throw new Error(`Error deleting feature: ${error.message}`);
        }
    }

    async getFeature(options) {
        try {
            const feature = await Feature.findOne(options).lean();
            return feature;
        } catch (error) {
            throw new Error(`Error fetching feature: ${error.message}`);
        }
    }

    async getFeatures(options){
        try {
            const features = await Feature.find(options).lean();
            return features;
        } catch (error) {
            throw new Error(`Error fetching features: ${error.message}`);
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

    async getAllFeatures(selectFields = []) {
        try {
            const features = await Feature.find().select(selectFields).lean();
            return features;
        } catch (error) {
            throw new Error(`Error fetching features: ${error.message}`);
        }
    }

    // In FeatureRepository.ts
    async validateFeatureIds(featureIds) {
        const features = await Feature.find({ _id: { $in: featureIds } });
        return features
    }
}

module.exports = new FeatureRepository();