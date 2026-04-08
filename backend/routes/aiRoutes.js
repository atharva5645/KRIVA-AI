const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { processVoiceCommand } = require('../controllers/aiAssistantController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!require('fs').existsSync(uploadDir)) {
            require('fs').mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `voice-${Date.now()}.webm`);
    }
});

const upload = multer({ storage });

// POST /api/ai/voice-assistant
router.post('/voice-assistant', upload.single('audio'), processVoiceCommand);

module.exports = router;
