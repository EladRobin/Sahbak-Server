const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/users');
const itemRoutes = require('./routes/itemRoutes');
// const profileRoutes = require('./routes/profile');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/users', authRoutes); // נכון, שורה אחת מספיקה
app.use('/api/items', itemRoutes);
app.use('/api/profile', authRoutes); 
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

