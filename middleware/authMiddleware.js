const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKey'; // ודא שזה אותו מפתח שמשתמשים בו ב-signing

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'התחברות נדרשת' });

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
  if (!token) return res.status(401).json({ message: 'התחברות נדרשת' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Unauthorized, token invalid or expired' });
    req.user = user; // אפשר לגשת ל-user בהמשך ה-routes
    next();
  });
}

module.exports = authenticateToken;
