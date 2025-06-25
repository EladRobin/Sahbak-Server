// utils/emailSender.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// הדפסת משתנים לבדיקה
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(toEmail, otpCode) {
  const mailOptions = {
    from: `"מערכת" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'קוד אימות (OTP)',
    text: `הקוד שלך הוא: ${otpCode}. תקף ל-10 דקות.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (err) {
    console.error('❌ Error sending mail:', err);
  }
}

module.exports = sendOtpEmail;

// נסיון שליחה לצורך בדיקה (מחק שורה זו בפרודקשן)
// sendOtpEmail('yourtestemail@gmail.com', '123456');
