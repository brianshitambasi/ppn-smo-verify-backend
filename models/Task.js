const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  requiredScreenshots: { type: Number, default: 3 },
  requiresNotes: { type: Boolean, default: true },
  requiresVoiceNote: { type: Boolean, default: true }
});

module.exports = mongoose.model('Task', taskSchema);
