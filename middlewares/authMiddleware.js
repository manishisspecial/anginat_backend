const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role,
            institution: decoded.institution,
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
const hasAccess = (requiredRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(requiredRoles)) {
        requiredRoles = [requiredRoles];
    }

    if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    next();
};

module.exports = {
    verifyToken,
    hasAccess
};