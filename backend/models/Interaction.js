const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  swiper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  swipee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  action: { 
    type: String, 
    enum: ['passed', 'initiated_chat'],
    required: true 
  }
}, { timestamps: true });

interactionSchema.index({ swiper: 1, swipee: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', interactionSchema);