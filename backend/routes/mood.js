const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// POST: Log mood with AI analysis
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { mood, moodText } = req.body;

    if (!mood || !moodText) {
      return res.status(400).json({ error: 'Please provide mood and moodText' });
    }

    // Call Claude for mood analysis (optional - only if API key exists)
    let sentiment = 'neutral';
    let theme = 'General wellbeing';

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: `Analyze this mood entry and respond with ONLY a JSON object (no markdown):
{"sentiment": "one word sentiment", "theme": "brief theme description"}

Mood entry: "${moodText}"`
            }]
          })
        });

        const data = await response.json();
        const analysisText = data.content[0].text;
        const parsed = JSON.parse(analysisText.replace(/```json|```/g, '').trim());
        sentiment = parsed.sentiment || sentiment;
        theme = parsed.theme || theme;
      } catch (aiError) {
        console.log('AI analysis skipped:', aiError.message);
      }
    }

    // Save mood log
    const moodLog = new MoodLog({
      userId: req.user.id,
      mood,
      moodText,
      sentiment,
      theme
    });
    await moodLog.save();

    // Award coins
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { guardianCoins: 10 } 
    });

    res.json({
      success: true,
      message: 'Mood logged successfully',
      moodLog: {
        mood,
        sentiment,
        theme,
        timestamp: moodLog.timestamp
      },
      coinsEarned: 10,
      reflection: `I hear that you are feeling ${sentiment}. It seems like ${theme.toLowerCase()} is on your mind.`
    });

  } catch (error) {
    console.error('Mood log error:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

// GET: Get mood history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const moods = await MoodLog.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(30);

    res.json({
      success: true,
      count: moods.length,
      moods
    });

  } catch (error) {
    console.error('Mood history error:', error);
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

module.exports = router;