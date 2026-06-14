const express = require('express');
const router = express.Router();
const { submitTask, getMySubmission, getAllMySubmissions } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const canSubmitToday = require('../middleware/timeCheckMiddleware');

// Upload fields: screenshots (3 files), notesPhoto (1 file), voiceNote (1 file)
router.post(
  '/submit',
  protect,
  canSubmitToday,
  upload.fields([
    { name: 'screenshots[]', maxCount: 3 },
    { name: 'notesPhoto', maxCount: 1 },
    { name: 'voiceNote', maxCount: 1 }
  ]),
  submitTask
);

router.get('/my/:week/:day', protect, getMySubmission);
router.get('/my/all', protect, getAllMySubmissions);

module.exports = router;
