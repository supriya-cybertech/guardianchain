const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// POST: Submit personality quiz
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // Array of answer scores

    if (!answers || answers.length < 4) {
      return res.status(400).json({ error: 'Invalid quiz answers' });
    }

    // Calculate personality traits (simplified scoring)
    const traits = {
      energy: answers[0] || 50,
      social: answers[1] || 50,
      planning: answers[2] || 50,
      thinking: answers[3] || 50
    };

    // Determine archetype based on traits
    let archetype = 'The Balanced Guardian';
    
    if (traits.energy > 70 && traits.social > 70) {
      archetype = 'The Solar Athlete';
    } else if (traits.energy < 30 && traits.planning > 70) {
      archetype = 'The Lunar Dreamer';
    } else if (traits.thinking > 70 && traits.planning > 70) {
      archetype = 'The Strategic Sage';
    } else if (traits.social > 70 && traits.thinking > 70) {
      archetype = 'The Empathic Healer';
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        personalityTraits: traits,
        archetype,
        quizCompleted: true,
        $inc: { guardianCoins: 100 } // Bonus for completing quiz!
      },
      { new: true }
    );

    res.json({
      success: true,
      archetype,
      traits,
      coinsEarned: 100,
      description: getArchetypeDescription(archetype)
    });

  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Failed to process quiz' });
  }
});

// Helper function for archetype descriptions
function getArchetypeDescription(archetype) {
  const descriptions = {
    'The Solar Athlete': 'You radiate energy and thrive in social, active environments. Your strength lies in motivation and physical vitality.',
    'The Lunar Dreamer': 'Introspective and thoughtful, you find power in quiet moments and careful planning. Your intuition guides you.',
    'The Strategic Sage': 'Analytical and organized, you excel at problem-solving and long-term planning. Your wisdom is your strength.',
    'The Empathic Healer': 'Socially aware and emotionally intelligent, you connect deeply with others and bring harmony to any situation.',
    'The Balanced Guardian': 'You maintain equilibrium across all aspects of life, bringing stability and adaptability to every challenge.'
  };
  
  return descriptions[archetype] || descriptions['The Balanced Guardian'];
}

module.exports = router;