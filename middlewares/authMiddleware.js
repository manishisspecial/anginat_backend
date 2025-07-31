const jwt = require("jsonwebtoken");
const User = require("../models/User");


const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Access token is missing"
      });
  }

  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("institutionId", "name institutionType featureAccessMode")
      .lean();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // // Check if user is active
    // if (!user.isActive) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'User account is inactive',
    //     code: 'USER_INACTIVE'
    //   });
    // }

    //     // Check if user is locked
    // if (user.lockedUntil && user.lockedUntil > new Date()) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'User account is locked',
    //     code: 'USER_LOCKED'
    //   });
    // }


    req.user = {
      id: user._id,
      role: user.role,
      institutionId: user.institutionId._id,
      institutionType : user.institutionId.institutionType,
      featureAccessMode: user.institutionId.featureAccessMode,
      isActive: user.isActive,
    };

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const hasAccess = (requiredRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }

  if (!requiredRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};


const authenticateServiceToken = (req, res, next) => {
  try {
    const serviceToken = req.headers['x-service-token'];
    // Check for service token in header
    if (serviceToken) {
      if (serviceToken !== process.env.SERVICE_SECRET_TOKEN) {
        return res.status(401).json({
          success: false,
          message: 'Invalid service token',
        });
      }
      return next(); // Valid service token, proceed to the next middleware
    }

    // If no service token is provided, return an error
    return res.status(401).json({
      success: false,
      message: 'Service token is missing',
    });
  } catch (error) {
    console.error('Service auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};


module.exports = {
  authenticateServiceToken,
  verifyToken,
  hasAccess,
};
