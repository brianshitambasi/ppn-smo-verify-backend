const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Seed tasks (run once to populate database)
// @route   POST /api/tasks/seed
const seedTasks = async (req, res) => {
  const tasks = [];
  
  // Week 1 (days 1-11)
  for (let i = 1; i <= 11; i++) {
    tasks.push({ 
      week: 1, 
      day: i, 
      title: `Week 1 Day ${i}`,
      description: 'Watch the assigned video and take handwritten notes',
      videoUrl: '',
      requiredScreenshots: 3,
      requiresNotes: true,
      requiresVoiceNote: true
    });
  }
  
  // Week 2 (days 12-20)
  for (let i = 12; i <= 20; i++) {
    tasks.push({ 
      week: 2, 
      day: i, 
      title: `Week 2 Day ${i}`,
      description: 'Watch the assigned video and take handwritten notes',
      videoUrl: '',
      requiredScreenshots: 3,
      requiresNotes: true,
      requiresVoiceNote: true
    });
  }
  
  // Week 3 (days 21-30)
  for (let i = 21; i <= 30; i++) {
    tasks.push({ 
      week: 3, 
      day: i, 
      title: `Week 3 Day ${i}`,
      description: 'Watch the assigned video and take handwritten notes',
      videoUrl: '',
      requiredScreenshots: 3,
      requiresNotes: true,
      requiresVoiceNote: true
    });
  }
  
  // Week 4 (days 31-38)
  for (let i = 31; i <= 38; i++) {
    tasks.push({ 
      week: 4, 
      day: i, 
      title: `Week 4 Day ${i}`,
      description: 'Watch the assigned video and take handwritten notes',
      videoUrl: '',
      requiredScreenshots: 3,
      requiresNotes: true,
      requiresVoiceNote: true
    });
  }
  
  await Task.deleteMany({});
  await Task.insertMany(tasks);
  res.json({ message: 'Tasks seeded successfully', count: tasks.length });
};

// @desc    Get today's task for logged-in user
// @route   GET /api/tasks/today
const getTodayTask = async (req, res) => {
  const user = await User.findById(req.user.id);
  const { currentWeek, currentDay } = user;
  const task = await Task.findOne({ week: currentWeek, day: currentDay });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

// @desc    Get specific task by week and day
// @route   GET /api/tasks/:week/:day
const getTaskByWeekDay = async (req, res) => {
  const { week, day } = req.params;
  const task = await Task.findOne({ week: parseInt(week), day: parseInt(day) });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

// @desc    Get all tasks (admin only)
// @route   GET /api/tasks/all
const getAllTasks = async (req, res) => {
  const tasks = await Task.find().sort({ week: 1, day: 1 });
  res.json(tasks);
};

module.exports = { seedTasks, getTodayTask, getTaskByWeekDay, getAllTasks };
