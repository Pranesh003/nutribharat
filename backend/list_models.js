require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-1.5-pro"
    ];

    let found = false;
    let log = "";

    for (const m of candidates) {
        try {
            console.log(`Trying ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hi");
            console.log(`✅ ${m} WORKED!`);
            log += `✅ ${m} WORKED!\n`;
            found = true;
            break; // Stop at first success
        } catch (error) {
            console.log(`❌ ${m} failed: ${error.message.substring(0, 50)}...`);
            log += `❌ ${m} failed: ${error.message}\n`;
        }
    }
    fs.writeFileSync('error_log.txt', log);
}

listModels();
