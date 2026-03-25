const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { authenticateToken } = require('../middleware/auth');

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/image', authenticateToken, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(400).json({ message: "Image upload failed", error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        console.log("Image received. Size:", req.file.size, "Mime:", req.file.mimetype);

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Analyze this image of food. Identify the dish and estimate its nutritional content.
        If it's not food, return { "error": "Not recognized as food" }.
        Return ONLY a JSON object with this format (no markdown):
        {
            "item": "Name of the dish",
            "calories": 123 (integer),
            "protein": "10g",
            "carbs": "20g",
            "fat": "5g",
            "confidence": "High/Medium/Low"
        }`;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype,
            },
        };

        console.log("Sending to Gemini...");
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();
        console.log("Gemini Raw Response:", text);

        // Clean up markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (jsonError) {
            console.error("JSON Parse Error. Raw text:", text);
            res.status(500).json({ message: "Failed to parse AI response", raw: text });
        }

    } catch (error) {
        console.error("Scan Error Details:", error);
        res.status(500).json({ message: "Analysis failed", error: error.message });
    }
});

module.exports = router;
