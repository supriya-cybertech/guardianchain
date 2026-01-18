const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  mood: { 
    type: String, 
    required: true 
  },
  moodText: {
    type: String,
    required: true
  },
  sentiment: { 
    type: String 
  },
  theme: {
    type: String
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('MoodLog', moodLogSchema);