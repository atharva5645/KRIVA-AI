const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");

exports.processVoiceCommand = async (req, res, next) => {
    try {
        console.log("--- Voice Assistant Request Start ---");
        if (!req.file) {
            console.error("No audio file in request");
            return res.status(400).json({ success: false, error: "No audio file provided" });
        }

        const apiKey = process.env.GROQ_API_KEY || process.env.VOICE_ASSISTANT_GROQ_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "Voice assistant is not configured. Set VOICE_ASSISTANT_GROQ_KEY or GROQ_API_KEY in backend/.env."
            });
        }

        const groq = new Groq({ apiKey });

        // 1. STT: Whisper Large V3 (using Buffer/Stream for serverless)
        console.log("Starting STT with whisper-large-v3...");

        const transcription = await groq.audio.transcriptions.create({
            file: await Groq.toFile(req.file.buffer, 'voice.webm'),
            model: "whisper-large-v3",
            response_format: "json"
        });

        const transcript = transcription.text;
        console.log("Transcript successful:", transcript);

        // 2. LLM: Llama 3 for Intent Extraction
        console.log("Starting LLM intent extraction...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful multilingual farming assistant for KRIVA Digital Market.
                    You understand and respond in Hindi, English, Kannada, and Marathi.
                    
                    IMPORTANT RULES:
                    1. Detect the language of the user's input.
                    2. Reply in the SAME language the user spoke in. For example, if the user speaks in Kannada, reply in Kannada. If Hindi, reply in Hindi.
                    3. If the language is mixed or unclear, default to Hindi.
                    
                    Return ONLY a JSON object with these fields:
                    - reply: A helpful, concise response in the SAME language as the user's input.
                    - action: One of [SEARCH_PRODUCT, NAVIGATE, GET_MARKET_TRENDS, SHOW_HELP, NONE].
                    - target: The specific product or page in ENGLISH (e.g., 'Tomato', '/marketplace').
                    - language: The detected language code: "en" for English, "hi" for Hindi, "kn" for Kannada, "mr" for Marathi.
                    IMPORTANT: For action=NAVIGATE, only return a relative path like '/heatmap', NEVER a full URL.`
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);
        console.log("AI Response successful:", aiResponse);

        console.log("--- Voice Assistant Request Completed Successfully ---");
        res.json({
            success: true,
            transcript,
            ...aiResponse
        });

    } catch (error) {
        console.error("AI Assistant Error:", {
            message: error.message,
            status: error.status || error.response?.status,
            name: error.name,
            stack: error.stack,
            apiError: error.error,
            response: error.response?.data,
            timestamp: new Date().toISOString()
        });
        const statusCode = error.status || error?.response?.status || 500;
        const errorMessage =
            error?.error?.message ||
            error?.response?.data?.error?.message ||
            error?.response?.data?.error ||
            error.message ||
            "Voice processing failed.";

        return res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
};
