const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/users'); // התחברות / הרשמה
const itemRoutes = require('./routes/itemRoutes'); // ✅ הוספת זה!

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/users', authRoutes); // /api/users/login וכו'
app.use('/api/items', itemRoutes); // ✅ מכסה POST /api/items וכו'

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
