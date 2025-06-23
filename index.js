// Server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/users'); // 👈 אנחנו עובדים עם users.js

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/users', authRoutes); // 👈 ייתן: /api/users/login ו־/register

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// אם יש לך מודל אחר כמו Item, תוכל להוסיף אותו כאן
// const itemRoutes = require('./routes/itemRoutes');