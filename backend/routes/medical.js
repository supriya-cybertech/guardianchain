const express = require('express');
const router = express.Router();
const multer = require('multer');
const MedicalAnalysis = require('../models/MedicalAnalysis');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Setup file upload (store in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST: Analyze medical image
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { imageType } = req.body;
    const imageFile = req.file;

    // Validation
    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!imageType || !['xray', 'prescription', 'report'].includes(imageType)) {
      return res.status(400).json({ error: 'Invalid image type. Use: xray, prescription, or report' });
    }

    // Convert image to base64
    const base64Image = imageFile.buffer.toString('base64');
    const mimeType = imageFile.mimetype;

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Call Claude API for image analysis
    const prompt = imageType === 'xray' 
      ? `Analyze this X-ray image. Provide:
1) Key findings (as an array)
2) Observations about bone/tissue structure (as an array)
3) Recommendations (as an array)

Format your response as JSON with these exact fields:
{
  "findings": ["finding1", "finding2"],
  "observations": ["observation1", "observation2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

IMPORTANT: Add a disclaimer that this is AI analysis and not a medical diagnosis.`
      : `Analyze this prescription image. Extract:
1) Medication names (as an array)
2) Dosages (as an array)
3) Instructions (as an array)

Format your response as JSON with these exact fields:
{
  "medications": ["med1", "med2"],
  "dosages": ["dosage1", "dosage2"],
  "instructions": ["instruction1", "instruction2"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Claude API error:', data);
      return res.status(500).json({ error: 'AI analysis failed', details: data });
    }

    const analysisText = data.content[0].text;
    
    // Try to parse as JSON
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        analysisText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      // If parsing fails, return raw text
      analysis = { 
        rawText: analysisText,
        type: imageType 
      };
    }

    // Save to database
    const medicalAnalysis = new MedicalAnalysis({
      userId: req.user.id,
      imageType,
      analysis,
      coinsEarned: 25
    });
    await medicalAnalysis.save();

    // Award coins
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { guardianCoins: 25 } 
    });

    res.json({ 
      success: true, 
      analysis,
      coinsEarned: 25,
      message: 'Image analyzed successfully!',
      disclaimer: 'GuardianChain insights are AI-generated and do not replace professional medical advice. Please consult a healthcare provider.'
    });

  } catch (error) {
    console.error('Medical analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// GET: Get user's medical history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const analyses = await MedicalAnalysis.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      count: analyses.length,
      analyses
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;