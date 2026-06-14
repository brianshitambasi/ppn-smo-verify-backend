const moment = require('moment-timezone');

const getCurrentDayStatus = () => {
  const now = moment().tz('Africa/Nairobi');
  return {
    date: now.format('YYYY-MM-DD'),
    hour: now.hour(),
    minute: now.minute(),
    isPastDeadline: now.isAfter(now.clone().endOf('day')),
    remainingMinutes: now.clone().endOf('day').diff(now, 'minutes')
  };
};

module.exports = { getCurrentDayStatus };
