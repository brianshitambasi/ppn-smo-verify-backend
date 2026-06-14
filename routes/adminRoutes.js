const express = require('express');
const router = express.Router();
const { 
  getPendingSubmissions, 
  approveSubmission, 
  rejectSubmission, 
  getAllUsers, 
  getUserProgress,
  forceAdvance
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require admin or ace-leader role
router.use(protect, adminOnly);

router.get('/pending', getPendingSubmissions);
router.put('/approve/:submissionId', approveSubmission);
router.put('/reject/:submissionId', rejectSubmission);
router.get('/users', getAllUsers);
router.get('/user/:userId/progress', getUserProgress);
router.post('/force-advance', forceAdvance);

module.exports = router;
