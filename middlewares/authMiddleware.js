const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
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
