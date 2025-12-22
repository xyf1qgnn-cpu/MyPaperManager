const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/translate', protect, aiController.translate);
router.post('/summarize', protect, aiController.summarizeDocument);

module.exports = router;
