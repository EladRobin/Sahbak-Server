const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'התחברות נדרשת' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'התחברות נדרשת' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized, token invalid or expired' });
    req.user = decoded;
    next();
  });
}

function checkAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'אין הרשאה' });
  }
  next();
}

module.exports = { authenticateToken, checkAdmin };
