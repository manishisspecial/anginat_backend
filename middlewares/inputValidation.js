// Middleware for validation
const validateInput = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }))
    });
  }
  next();
};

module.exports = {validateInput};