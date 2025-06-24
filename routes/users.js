// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// הגדרות אחסון לקבצים
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}${ext}`);
  },
});
const upload = multer({ storage });

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

    const isAdmin = user.isAdmin === true;
    const token = jwt.sign({ userId: user._id, isAdmin }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user._id, isAdmin });
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
});

// שליחת קישור איפוס סיסמה
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'יש להזין אימייל' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'משתמש לא נמצא' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10m' });
    const resetLink = `${CLIENT_URL}/set-new-password/${token}`;

    return res.status(200).json({ message: 'קישור נשלח למייל (מדומה)', link: resetLink });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// קבלת סיסמה חדשה
router.post('/set-new-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
    res.json({ message: 'הסיסמה עודכנה בהצלחה' });
  } catch (err) {
    return res.status(400).json({ message: 'טוקן לא תקין או שפג תוקפו' });
  }
});

// הצגת פרופיל
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName tz email phone class profileImage');
    if (!user) return res.status(404).json({ message: 'המשתמש לא נמצא' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשרת', error });
  }
});

// עדכון פרופיל
router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, email, phone, class: userClass } = req.body;
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phone, class: userClass },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'המשתמש לא נמצא' });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'שגיאה בעדכון הפרופיל', error });
  }
});

// העלאת תמונת פרופיל
router.post('/upload-image/:id', upload.single('image'), async (req, res) => {
  try {
    const ext = path.extname(req.file.originalname);
    const filename = `${req.params.id}${ext}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: `/uploads/${filename}` },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'המשתמש לא נמצא' });

    res.json({ message: 'תמונה נשמרה', imageUrl: user.profileImage });
  } catch (error) {
    console.error('שגיאה בהעלאת תמונה:', error);
    res.status(500).json({ message: 'שגיאה בהעלאה', error });
  }
});

// API לקבלת רשימת כל המשתמשים
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName tz');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

module.exports = router;
