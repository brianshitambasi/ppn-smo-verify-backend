const express = require('express');
const router = express.Router();
const { seedTasks, getTodayTask, getTaskByWeekDay, getAllTasks } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/seed', protect, adminOnly, seedTasks);
router.get('/today', protect, getTodayTask);
router.get('/all', protect, adminOnly, getAllTasks);
router.get('/:week/:day', protect, getTaskByWeekDay);

module.exports = router;
