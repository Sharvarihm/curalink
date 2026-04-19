const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', require('./src/routes/chat'));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Curalink API is running',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});