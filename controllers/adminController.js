const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Get all pending submissions
// @route   GET /api/admin/pending
const getPendingSubmissions = async (req, res) => {
  const submissions = await Submission.find({ status: 'pending' }).populate('userId', 'name email currentWeek currentDay');
  res.json(submissions);
};

// @desc    Approve a submission
// @route   PUT /api/admin/approve/:submissionId
const approveSubmission = async (req, res) => {
  const { submissionId } = req.params;
  
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  
  submission.status = 'approved';
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = Date.now();
  await submission.save();
  
  // Update user's progress
  const user = await User.findById(submission.userId);
  if (!user.completedDays.includes(submission.day)) {
    user.completedDays.push(submission.day);
    
    // Move to next day
    const nextDay = submission.day + 1;
    if (nextDay <= 38) {
      if (nextDay > 11 && nextDay <= 20) user.currentWeek = 2;
      else if (nextDay > 20 && nextDay <= 30) user.currentWeek = 3;
      else if (nextDay > 30 && nextDay <= 38) user.currentWeek = 4;
      else user.currentWeek = 1;
      user.currentDay = nextDay;
    }
    
    // Check for graduation (day 38 completed)
    if (submission.day === 38) {
      user.graduated = true;
    }
    
    await user.save();
  }
  
  res.json({ message: 'Submission approved', submission });
};

// @desc    Reject a submission
// @route   PUT /api/admin/reject/:submissionId
const rejectSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { adminComment } = req.body;
  
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  
  submission.status = 'rejected';
  submission.adminComment = adminComment || 'Please re-submit with correct requirements';
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = Date.now();
  await submission.save();
  
  res.json({ message: 'Submission rejected', submission });
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// @desc    Get user progress by ID
// @route   GET /api/admin/user/:userId/progress
const getUserProgress = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).select('-password');
  const submissions = await Submission.find({ userId, status: 'approved' });
  
  res.json({
    user,
    approvedDays: submissions.length,
    progress: ((submissions.length / 38) * 100).toFixed(2) + '%'
  });
};

module.exports = { 
  getPendingSubmissions, 
  approveSubmission, 
  rejectSubmission, 
  getAllUsers, 
  getUserProgress 
};

// @desc    Manually trigger auto-advance job (for testing)
// @route   POST /api/admin/force-advance
const forceAdvance = async (req, res) => {
  try {
    const { autoAdvance } = require('../jobs/autoAdvance');
    await autoAdvance();
    res.json({ message: 'Auto-advance job executed manually' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getPendingSubmissions, 
  approveSubmission, 
  rejectSubmission, 
  getAllUsers, 
  getUserProgress,
  forceAdvance
};
