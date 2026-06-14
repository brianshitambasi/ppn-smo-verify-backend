const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');

const autoAdvance = async () => {
  console.log('Ì¥Ñ Running auto-advance job...', new Date().toISOString());
  try {
    // Step 1: Complete Week 1 for anyone still on week 1 (one-time catch-up)
    const week1Days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const week1Result = await User.updateMany(
      { role: 'trainee', graduated: false, currentWeek: 1 },
      {
        $addToSet: { completedDays: { $each: week1Days } },
        $set: { currentWeek: 2, currentDay: 12 }
      }
    );
    if (week1Result.modifiedCount > 0) {
      console.log(`Ì≥¶ Week 1 completed for ${week1Result.modifiedCount} trainees`);
    }

    // Step 2: Advance trainees with approved submission for current day
    const trainees = await User.find({ role: 'trainee', graduated: false });
    let advancedCount = 0;
    let graduatedCount = 0;

    for (const trainee of trainees) {
      const { currentWeek, currentDay } = trainee;
      const approvedSubmission = await Submission.findOne({
        userId: trainee._id,
        week: currentWeek,
        day: currentDay,
        status: 'approved'
      });
      
      if (approvedSubmission) {
        let nextDay = currentDay + 1;
        let nextWeek = currentWeek;
        
        // Week boundaries
        if (nextDay > 11 && currentWeek === 1) {
          nextWeek = 2;
        } else if (nextDay > 20 && currentWeek === 2) {
          nextWeek = 3;
        } else if (nextDay > 30 && currentWeek === 3) {
          nextWeek = 4;
        } else if (nextDay > 38) {
          // Graduation!
          await User.updateOne(
            { _id: trainee._id },
            { 
              $set: { graduated: true, currentDay: 38 },
              $addToSet: { completedDays: currentDay }
            }
          );
          console.log(`Ìæì ${trainee.name} GRADUATED!`);
          graduatedCount++;
          continue;
        }
        
        // Advance to next day
        await User.updateOne(
          { _id: trainee._id },
          {
            $set: { currentWeek: nextWeek, currentDay: nextDay },
            $addToSet: { completedDays: currentDay }
          }
        );
        console.log(`‚úÖ ${trainee.name} ‚Üí Week ${nextWeek}, Day ${nextDay}`);
        advancedCount++;
      }
    }
    
    console.log(`Ì≥ä Auto-advance summary: ${advancedCount} advanced, ${graduatedCount} graduated`);
    console.log('‚úÖ Auto-advance job finished');
  } catch (err) {
    console.error('‚ùå Auto-advance error:', err);
  }
};

// Schedule at midnight every day (Africa/Nairobi timezone)
cron.schedule('0 0 * * *', autoAdvance, { timezone: 'Africa/Nairobi' });

console.log('‚è∞ Auto-advance cron job scheduled (midnight EAT)');

module.exports = { autoAdvance };
