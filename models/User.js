const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['trainee', 'admin', 'ace-leader'], default: 'trainee' },
  connector: { type: String, default: '' },
  dateOfJoining: { type: Date, default: Date.now },
  currentWeek: { type: Number, default: 1 },
  currentDay: { type: Number, default: 1 },
  completedDays: [Number],
  graduated: { type: Boolean, default: false },
  missedDaysCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
