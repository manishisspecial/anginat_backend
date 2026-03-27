const Joi = require("joi");

const roleEnum = ['admin', 'instructor', 'student', 'super-admin'];

const updateUserDataSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  username: Joi.string().min(3).max(30).optional(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  role: Joi.string().valid(...roleEnum).optional(),
});

const adminUpdateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  username: Joi.string().min(3).max(30).optional(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  role: Joi.string().valid(...roleEnum).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  updateUserDataSchema,
  adminUpdateUserSchema,
};