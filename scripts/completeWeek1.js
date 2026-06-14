const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');

const completeWeek1ForAllTrainees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const week1Days = Array.from({ length: 11 }, (_, i) => i + 1);

    const result = await User.updateMany(
      { role: 'trainee', graduated: false, currentWeek: { $lt: 2 } },
      {
        $addToSet: { completedDays: { $each: week1Days } },
        $set: { currentWeek: 2, currentDay: 12, updatedAt: new Date() }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} trainees.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
};

completeWeek1ForAllTrainees();
