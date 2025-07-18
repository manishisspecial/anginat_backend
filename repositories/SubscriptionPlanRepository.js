const SubscriptionPlan = require("../models/SubscriptionPlan")


class SubscriptionPlanRepository {

    async createSubscriptionPlan(planData) {
        try {
            const plan = new SubscriptionPlan(planData);
            return await plan.save();
        } catch (error) {
            throw new Error(`Error creating subscription plan: ${error.message}`);
        }
    }
    
    async upgradeSubscriptionPlan(planId, updateData) {
        try {
            const updatedPlan = await Subscription.findOneAndUpdate({
                _id: planId
            }, updateData, { new: true });
            return updatedPlan;
        } catch (error) {S
            throw new Error(`Error upgrading subscription plan: ${error.message}`);
        }   
    }

    async getSubscriptionPlanById(planId) {
        try {
            const plan = await SubscriptionPlan.findById(planId);
            if (!plan) {    
                throw new Error('Subscription plan not found');
            }       
            return plan;
        } catch (error) {   
            throw new Error(`Error fetching subscription plan: ${error.message}`);
        }
    }

    async getAllSubscriptionPlans(){
        try {
            const plans = await SubscriptionPlan.find();
            return plans;
        } catch (error) {
            throw new Error(`Error fetching subscription plans: ${error.message}`);
        }
    } 

}