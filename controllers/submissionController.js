const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Submit a daily task (with files)
// @route   POST /api/submissions/submit
const submitTask = async (req, res) => {
  try {
    const { week, day } = req.body;
    const userId = req.user.id;
    
    // Files from multer: field names "screenshots[]", "notesPhoto", "voiceNote"
    const screenshots = req.files['screenshots[]'] ? req.files['screenshots[]'].map(f => f.path) : [];
    const notesPhoto = req.files['notesPhoto'] ? req.files['notesPhoto'][0].path : null;
    const voiceNote = req.files['voiceNote'] ? req.files['voiceNote'][0].path : null;

    if (screenshots.length < 3) {
      return res.status(400).json({ message: 'Please upload at least 3 screenshots' });
    }
    if (!notesPhoto) return res.status(400).json({ message: 'Notes photo required' });
    if (!voiceNote) return res.status(400).json({ message: 'Voice note required' });

    // Check if already approved for this day
    const existing = await Submission.findOne({ userId, week, day, status: 'approved' });
    if (existing) {
      return res.status(400).json({ message: 'Task already approved for this day' });
    }

    const submission = await Submission.findOneAndUpdate(
      { userId, week, day },
      { screenshots, notesPhoto, voiceNote, status: 'pending', submittedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ message: 'Submission received, pending admin approval', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's submission for a specific day
// @route   GET /api/submissions/my/:week/:day
const getMySubmission = async (req, res) => {
  const { week, day } = req.params;
  const submission = await Submission.findOne({ userId: req.user.id, week: parseInt(week), day: parseInt(day) });
  res.json(submission || {});
};

// @desc    Get all my submissions
// @route   GET /api/submissions/my/all
const getAllMySubmissions = async (req, res) => {
  const submissions = await Submission.find({ userId: req.user.id }).sort({ week: 1, day: 1 });
  res.json(submissions);
};

module.exports = { submitTask, getMySubmission, getAllMySubmissions };
