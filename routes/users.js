// Server/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

// Register
router.post('/register', async (req, res) => {
  let { email, fullName, password } = req.body;
  if (!email || !fullName || !password) {
    return res.status(400).json({ message: 'חסר שדה חובה' });
  }
  email = email.toLowerCase().trim();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש כבר קיים' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, fullName, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'משתמש נרשם בהצלחה' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'משתמש לא נמצא' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'סיסמה שגויה' });

    // פה מזהים אם הוא אדמין
const isAdmin = user.isAdmin === true;

    // הטוקן כולל גם את isAdmin
    const token = jwt.sign({ userId: user._id, isAdmin }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user._id, isAdmin }); // ← חשוב! נשלח ללקוח גם את isAdmin
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
});


module.exports = router;

