const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
    try {
        console.log("1. Testing Chat Completion with Intent Extraction...");
        const transcript = "Search for Tomato prices"; // Simulated transcript
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful farming assistant for KRIVA Digital Market.
                    Analyze the user input (in English or Kannada) and return ONLY a JSON object:
                    - reply: A helpful, concise response in the language the user used.
                    - action: One of [SEARCH_PRODUCT, NAVIGATE, GET_MARKET_TRENDS, SHOW_HELP, NONE].
                    - target: The specific product or page in ENGLISH (e.g., 'Tomato', '/marketplace').
                    
                    Intents:
                    - Search/Price: action='SEARCH_PRODUCT', target='Crop Name in English'.
                    - Navigation: action='NAVIGATE', target='Route Path'.`
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });
        console.log("Chat successful!");
        console.log("Response JSON:", chatCompletion.choices[0].message.content);
        const parsed = JSON.parse(chatCompletion.choices[0].message.content);
        console.log("Parsed successfully!");

        console.log("2. Testing Audio Transcription...");
        // Use one of the uploaded files for testing
        const uploads = fs.readdirSync(path.join(__dirname, 'uploads'));
        if (uploads.length > 0) {
            const audioPath = path.join(__dirname, 'uploads', uploads[uploads.length - 1]);
            console.log(`Using file: ${audioPath}`);
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(audioPath),
                model: "whisper-large-v3",
                response_format: "json"
            });
            console.log("Transcription successful!");
            console.log("Result:", transcription.text);
        } else {
            console.log("No audio files found in uploads to test transcription.");
        }

    } catch (error) {
        console.error("Groq Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testGroq();
