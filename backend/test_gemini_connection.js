require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing from .env");
        return;
    }
    console.log("✅ Key found (Starts with: " + process.env.GEMINI_API_KEY.substring(0, 4) + "...)");

    try {
        console.log("Initializing Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        console.log("Sending test prompt...");
        const result = await model.generateContent("Say 'Hello from Gemini!'");
        const response = await result.response;
        console.log("✅ API Response:", response.text());
    } catch (error) {
        console.error("❌ API Call Failed:", error.message);
    }
}

testConnection();
