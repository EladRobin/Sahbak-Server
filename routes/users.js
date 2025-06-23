const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    const user = new User({
      email,
      fullName,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'משתמש נרשם בהצלחה' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'פרטים שגויים' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, userId: user._id });
});

module.exports = router;

