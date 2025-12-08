const Joi = require("joi");

const updateUserDataSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  username: Joi.string().optional(),
  phoneNumber : Joi.string().pattern(/^[0-9]{10,15}$/).optional()
});

module.exports = {
  updateUserDataSchema
};