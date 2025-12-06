const SubscriptionPlan = require("../models/SubscriptionPlan")


class SubscriptionPlanRepository {

    async createSubscriptionPlan(planData) {
        try {
            const plan = new SubscriptionPlan(planData);
            await plan.save();
            return await plan.populate('features.featureId')
        } catch (error) {
            throw new Error(`Error creating subscription plan: ${error.message}`);
        }
    }
    
    async updateSubscriptionPlan(planId, updateData) {
        try {
            const updatedPlan = await SubscriptionPlan.findOneAndUpdate({
                _id: planId
            }, updateData, { new: true }).populate('features.featureId');
            return updatedPlan;
        } catch (error) {S
            throw new Error(`Error upgrading subscription plan: ${error.message}`);
        }   
    }

    async deleteSubscriptionPlan(planId) {
        try {
            const deletedPlan = await SubscriptionPlan.findByIdAndDelete(planId);
            if (!deletedPlan) {
                throw new Error('Subscription plan not found');
            }
            return deletedPlan;
        } catch (error) {
            throw new Error(`Error deleting subscription plan: ${error.message}`);
        }
    }

    async getSubscriptionPlanById(planId,populateFields = []) {
        try {
            const plan = await SubscriptionPlan.findById(planId).populate(populateFields);
            if (!plan) {    
                throw new Error('Subscription plan not found');
            }       
            return plan;
        } catch (error) {   
            throw new Error(`Error fetching subscription plan: ${error.message}`);
        }
    }

    async getSubscriptionPlan(options = {}, populateFields = []) {
        try {
            let query = SubscriptionPlan.findOne(options);
            populateFields.forEach(field => {
                query = query.populate(field);
            });
            const plan = await query;
            return plan;
        } catch (error) {
            throw new Error(`Error fetching subscription plan: ${error.message}`);
        }
    }

    async getAllSubscriptionPlans(populateFields = []) {
        try {
            const plans = await SubscriptionPlan.find().populate(populateFields).lean();
            return plans;
        } catch (error) {
            throw new Error(`Error fetching subscription plans: ${error.message}`);
        }
    } 


}

module.exports = new SubscriptionPlanRepository();