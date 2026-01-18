const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'GuardianChain API is running!',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      mood: '/api/mood',
      medical: '/api/medical',
      workout: '/api/workout',
      personality: '/api/personality'
    }
  });
});

// Database Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Database Connected'))
    .catch(err => console.error('❌ Database Error:', err));
} else {
  console.log('⚠️  MONGO_URI not found in .env file');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/workout', require('./routes/workout'));
app.use('/api/personality', require('./routes/personality'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🔐 Auth: /api/auth`);
  console.log(`🧠 Mood: /api/mood`);
  console.log(`🏥 Medical: /api/medical`);
  console.log(`💪 Workout: /api/workout`);
  console.log(`🎭 Personality: /api/personality`);
});