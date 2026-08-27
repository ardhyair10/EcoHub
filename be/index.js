const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const wasteCategoryRoutes = require('./src/routes/wasteCategoryRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/waste-categories', wasteCategoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Eco Hub API', version: '1.0.0' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
