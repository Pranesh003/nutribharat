const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nutribharat-secret-key-change-me';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log("Auth Fail: No Token");
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Auth Fail: Invalid Token", err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken, JWT_SECRET };
