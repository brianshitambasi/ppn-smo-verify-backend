const moment = require('moment-timezone');

const canSubmitToday = (req, res, next) => {
  const now = moment().tz('Africa/Nairobi');
  const endOfDay = moment().tz('Africa/Nairobi').endOf('day');
  if (now.isAfter(endOfDay)) {
    return res.status(400).json({ message: 'Submission deadline (11:59 PM EAT) has passed for today' });
  }
  next();
};

module.exports = canSubmitToday;
