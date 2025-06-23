// Server/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ודא שיש לך מודל משתמש
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // מצא משתמש לפי מייל וסיסמה
    const user = await User.findOne({ email, password }); // הפשטה - אל תשתמש בסיסמה גולמית בפרודקשן!

    if (!user) {
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user.idNumber }); // או כל מזהה אחר
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשרת', error: err.message });
  }
};
