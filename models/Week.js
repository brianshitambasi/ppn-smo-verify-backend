const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  weekNumber: Number,
  days: [Number],
  graduationRequired: Boolean
});

module.exports = mongoose.model('Week', weekSchema);
