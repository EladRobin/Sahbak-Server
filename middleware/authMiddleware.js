const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey'; // שנה ל-secret שלך בקובץ .env

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: 'התחברות נדרשת' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'התחברות נדרשת' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(401).json({ message: 'Unauthorized, token invalid or expired' });
    }
    req.user = decoded; // ניתן לגשת לנתוני המשתמש בהמשך
    next();
  });
}

module.exports = authenticateToken;
