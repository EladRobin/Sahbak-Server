const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes'); // ← תיקון כאן


dotenv.config();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/items', itemRoutes); // לדוגמה
app.use('/api/auth', authRoutes); // זה מוסיף את /api/auth/login

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


