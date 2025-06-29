// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendOtpEmail = require('../utils/emailSender');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// הגדרות אחסון תמונות פרופיל
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

// --- רישום משתמש ---
router.post('/register', async (req, res) => {
  try {
    let { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: 'חסר שדה חובה' });
    }
    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'משתמש כבר קיים' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, fullName, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'משתמש נרשם בהצלחה' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// --- התחברות ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'משתמש לא נמצא' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'סיסמה שגויה' });

    const isAdmin = user.isAdmin === true;
    const token = jwt.sign({ userId: user._id, isAdmin }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user._id, isAdmin });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// --- הצגת פרופיל ---
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName tz email phone class profileImage');
    if (!user) return res.status(404).json({ message: 'המשתמש לא נמצא' });
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// --- עדכון פרופיל ---
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
    res.status(500).json({ message: 'שגיאה בעדכון הפרופיל' });
  }
});

// --- העלאת תמונת פרופיל ---
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
    res.status(500).json({ message: 'שגיאה בהעלאה' });
  }
});

// --- קבלת רשימת כל המשתמשים ---
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName tz');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// --- שליחת קוד OTP למייל ---
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'יש להזין מייל' });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 ספרות
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // פג תוקף ב-10 דקות

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'משתמש לא נמצא' });

    await Otp.deleteMany({ email }); // מחק קודים ישנים

    const otp = new Otp({ email, code: otpCode, expiresAt });
    await otp.save();

    await sendOtpEmail(email, otpCode);

    res.json({ message: 'קוד נשלח למייל' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'שליחת קוד נכשלה' });
  }
});

// --- אימות קוד OTP ---
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'יש להזין מייל וקוד' });

  try {
    const record = await Otp.findOne({ email, code });
    if (!record) return res.status(400).json({ message: 'קוד שגוי' });

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'הקוד פג תוקף' });
    }

    await Otp.deleteOne({ _id: record._id }); // מוחק לאחר אימות מוצלח (אופציונלי)
    res.json({ message: 'הקוד אומת בהצלחה' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'שגיאה באימות הקוד' });
  }
});

// --- איפוס סיסמה עם OTP ---
router.post('/reset-password-with-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'יש למלא את כל השדות' });

  try {
    const record = await Otp.findOne({ email, code: otp });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP שגוי או שפג תוקפו' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    await Otp.deleteOne({ _id: record._id });

    res.json({ message: 'הסיסמה אופסה בהצלחה' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

router.post('/save-signature', async (req, res) => {
  try {
    const { userId, signature } = req.body;
    if (!userId || !signature) return res.status(400).json({ message: 'חסרים פרטים' });

    // צור קובץ חתימה
    const base64Data = signature.replace(/^data:image\/png;base64,/, '');
    const filePath = path.join(__dirname, '..', 'uploads', `signature-${userId}.png`);
    fs.writeFileSync(filePath, base64Data, 'base64');

    // שמור גם במסד הנתונים
    await User.findByIdAndUpdate(userId, { signatureImage: `/uploads/signature-${userId}.png` });

    res.json({ message: 'חתימה נשמרה בהצלחה' });
  } catch (err) {
    console.error('Error saving signature:', err);
    res.status(500).json({ message: 'שגיאה בשמירת החתימה' });
  }
});





module.exports = router;

