const Joi = require('joi');

const createSubscriptionValidation = Joi.object({
    name: Joi.string().valid('free', 'pro', 'enterprise', 'trial').required(),
    displayName: Joi.string().required(),
    description: Joi.string().optional(),
    pricing: Joi.array().items(
        Joi.object({
            currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'AUD').required(),
            amount: Joi.number().required(),
            billingCycle: Joi.string().valid('weekly', 'monthly', 'quaterly', 'half-yearly', 'yearly').default('monthly')
        })
    ).optional(),

    limits: Joi.object({
        maxStudents: Joi.number().optional(),
        maxTeachers: Joi.number().optional(),
        maxClasses: Joi.number().optional(),
        maxSubjects: Joi.number().optional(),
        storageGB: Joi.number().optional(),
        maxAnnouncements: Joi.number().optional(),
        maxMediaFiles: Joi.number().optional()
    }).optional(),
    features: Joi.array().items(
        Joi.object({
            featureId: Joi.string().required(),
            isEnabled: Joi.boolean().default(true),
            usageLimit: Joi.number().allow(null).optional(),
            resetCycle: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'never').default('monthly')
        })
    ).optional(),
    isActive: Joi.boolean().default(true),
    sortOrder: Joi.number().default(0)
});

const updateSubscriptionValidation = Joi.object({
    name: Joi.string().valid('free', 'pro', 'enterprise', 'trial').optional(),
    displayName: Joi.string().optional(),
    description: Joi.string().optional(),
    pricing: Joi.array().items(
        Joi.object({
            currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'AUD').required(),
            amount: Joi.number().required(),
            billingCycle: Joi.string().valid('weekly', 'monthly', 'quaterly', 'half-yearly', 'yearly').default('monthly')
        })
    ).optional(),

    limits: Joi.object({
        maxStudents: Joi.number().optional(),
        maxTeachers: Joi.number().optional(),
        maxClasses: Joi.number().optional(),
        maxSubjects: Joi.number().optional(),
        storageGB: Joi.number().optional(),
        maxAnnouncements: Joi.number().optional(),
        maxMediaFiles: Joi.number().optional()
    }).optional(),
    sortOrder: Joi.number().optional()
});

const addFeaturesValidation = Joi.object({
    features: Joi.array().items(
        Joi.object({
            featureId: Joi.string().required(),
            isEnabled: Joi.boolean().optional(),
            usageLimit: Joi.number().optional().allow(null),
            resetCycle: Joi.string().optional().valid('daily', 'weekly', 'monthly', 'never')
        })
    ).required()
});

const removeFeatureValidation = Joi.object({
    featureIds: Joi.array().items(Joi.string().required()).required()
});

const updateFeatureValidation = Joi.object({
    isEnabled: Joi.boolean().optional(),
    usageLimit: Joi.number().optional().allow(null),
    resetCycle: Joi.string().optional().valid('daily', 'weekly', 'monthly', 'yearly', 'never')
});



module.exports = {
    createSubscriptionValidation,
    updateSubscriptionValidation,
    addFeaturesValidation,
    removeFeatureValidation, 
    updateFeatureValidation
};