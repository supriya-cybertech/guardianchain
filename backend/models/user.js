const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  guardianCoins: { 
    type: Number, 
    default: 0 
  },
  archetype: { 
    type: String, 
    default: null 
  },
  personalityTraits: {
    energy: { type: Number, default: 0 }, // 0-100
    social: { type: Number, default: 0 },
    planning: { type: Number, default: 0 },
    thinking: { type: Number, default: 0 }
  },
  quizCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);