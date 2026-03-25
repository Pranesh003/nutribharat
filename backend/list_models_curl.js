require('dotenv').config();
const fs = require('fs');

async function listModelsDirectly() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
        console.log("Saved to models.json");
    } catch (error) {
        console.error("❌ Fetch failed:", error.message);
    }
}

listModelsDirectly();
