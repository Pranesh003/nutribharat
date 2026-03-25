const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Please say something." });

        // System Prompt for Persona
        const systemPrompt = `You are "NutriBharat AI", an intelligent, empathetic, and Indian-context-aware nutritionist. 
        Your goal is to help users live healthier lives with practical Indian diet advice (Roti, Dal, Sabzi, Curd, etc.).
        
        Guidelines:
        - Keep answers concise (max 3-4 sentences allowed).
        - Use emojis occasionally (🙏, 🥗, 💪).
        - If asked about medical issues, give general advice but suggest consulting a doctor.
        - Tone: Professional yet friendly and motivating.
        
        User Query: "${message}"`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            console.error("Gemini Chat Error:", JSON.stringify(data, null, 2));
            reply = "I am having trouble connecting to my brain right now. Please try again later. 🙏";
        }

        res.json({ reply });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ reply: "My AI servers are currently busy. Please try again in a moment." });
    }
});

module.exports = router;
