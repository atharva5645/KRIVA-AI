const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { processVoiceCommand } = require('../controllers/aiAssistantController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for audio uploads (Memory storage for serverless compatibility)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/ai/voice-assistant
router.post('/voice-assistant', upload.single('audio'), processVoiceCommand);

module.exports = router;
