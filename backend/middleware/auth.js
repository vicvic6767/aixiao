const jwt = require('jsonwebtoken');

const JWT_SECRET = 'pet-rescue-secret-key-2024';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};

module.exports = { authMiddleware, JWT_SECRET };