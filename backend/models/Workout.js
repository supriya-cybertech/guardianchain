const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  workoutType: {
    type: String,
    required: true,
    enum: ['strength', 'cardio', 'yoga', 'flexibility', 'custom']
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    duration: Number,
    focusTip: String
  }],
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Workout', workoutSchema);