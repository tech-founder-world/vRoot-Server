// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({ success: false, message: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();

//     } catch (error) {
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({ success: false, message: 'Token expired, please login again' });
//         }
//         return res.status(401).json({ success: false, message: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ✅ IMPORTANT: Consistent way to get user ID
        req.user = {
            id: decoded.id || decoded.userId,  // Both formats supported
            ...decoded
        };
        req.userId = req.user.id;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired, please login again' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;