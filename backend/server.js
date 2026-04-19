const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://curalink-jet.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests and same-origin calls with no Origin header.
    if (!origin) return callback(null, true);

    try {
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
    } catch (error) {
      return callback(new Error('Invalid Origin header'));
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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