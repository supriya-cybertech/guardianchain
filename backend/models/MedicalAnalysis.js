const mongoose = require('mongoose');

const medicalAnalysisSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  imageType: { 
    type: String, 
    required: true,
    enum: ['xray', 'prescription', 'report']
  },
  analysis: { 
    type: Object,
    required: true
  },
  coinsEarned: {
    type: Number,
    default: 25
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('MedicalAnalysis', medicalAnalysisSchema);
