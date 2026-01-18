const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// POST: Generate AI workout
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { workoutType, duration, fitnessLevel } = req.body;

    // Default exercises (works without Claude API)
    const defaultWorkouts = {
      strength: [
        { name: 'Push-ups', sets: 3, reps: 12, duration: 5, focusTip: 'Keep your core tight and back straight' },
        { name: 'Squats', sets: 3, reps: 15, duration: 5, focusTip: 'Keep knees behind toes' },
        { name: 'Plank', sets: 3, reps: 1, duration: 3, focusTip: 'Hold for 30-60 seconds' },
        { name: 'Lunges', sets: 3, reps: 10, duration: 5, focusTip: 'Alternate legs, keep form tight' },
        { name: 'Dumbbell Rows', sets: 3, reps: 12, duration: 5, focusTip: 'Pull to your hip, squeeze shoulder blades' }
      ],
      cardio: [
        { name: 'Jumping Jacks', sets: 3, reps: 30, duration: 3, focusTip: 'Keep steady rhythm' },
        { name: 'High Knees', sets: 3, reps: 30, duration: 3, focusTip: 'Drive knees up high' },
        { name: 'Burpees', sets: 3, reps: 10, duration: 5, focusTip: 'Full body engagement' },
        { name: 'Mountain Climbers', sets: 3, reps: 20, duration: 4, focusTip: 'Keep core tight' }
      ],
      yoga: [
        { name: 'Downward Dog', sets: 3, reps: 1, duration: 3, focusTip: 'Hold for 30 seconds, breathe deeply' },
        { name: 'Warrior Pose', sets: 3, reps: 1, duration: 3, focusTip: 'Hold each side for 30 seconds' },
        { name: 'Child\'s Pose', sets: 2, reps: 1, duration: 4, focusTip: 'Relax and breathe' },
        { name: 'Tree Pose', sets: 3, reps: 1, duration: 3, focusTip: 'Focus on balance' }
      ],
      flexibility: [
        { name: 'Hamstring Stretch', sets: 3, reps: 1, duration: 3, focusTip: 'Hold 30 seconds each leg' },
        { name: 'Quad Stretch', sets: 3, reps: 1, duration: 3, focusTip: 'Balance and stretch' },
        { name: 'Shoulder Stretch', sets: 3, reps: 1, duration: 2, focusTip: 'Gentle pull across body' },
        { name: 'Hip Flexor Stretch', sets: 3, reps: 1, duration: 3, focusTip: 'Lunge position, hold' }
      ]
    };

    let exercises = defaultWorkouts[workoutType] || defaultWorkouts.strength;

    // Save workout
    const workout = new Workout({
      userId: req.user.id,
      workoutType,
      exercises
    });
    await workout.save();

    // Award coins
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { guardianCoins: 20 } 
    });

    res.json({
      success: true,
      workout,
      coinsEarned: 20
    });

  } catch (error) {
    console.error('Workout generation error:', error);
    res.status(500).json({ error: 'Failed to generate workout', details: error.message });
  }
});

// POST: Complete workout
router.post('/complete/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: true },
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { guardianCoins: 30 } 
    });

    res.json({
      success: true,
      message: 'Workout completed!',
      coinsEarned: 30
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to complete workout' });
  }
});

module.exports = router;