require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function getModels() {
    try {
        const response = await fetch(URL);
        const data = await response.json();

        let output = "";
        if (data.models) {
            output += "Available Models:\n";
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    output += `- ${m.name} (${m.displayName})\n`;
                }
            });
        } else {
            output += "Error: " + JSON.stringify(data, null, 2);
        }

        fs.writeFileSync('available_models.txt', output);
        console.log("Models written to available_models.txt");

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

getModels();
