const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to clean JSON
function cleanJSON(text) {
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        return text.substring(jsonStart, jsonEnd + 1);
    }
    return text;
}

// Generate Workout Plan
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const profile = user ? user.profile : {};

        // Default values
        const goal = profile?.goal || 'General Fitness';
        const activity = profile?.activity || 'moderate';
        const conditions = profile?.conditions && profile.conditions.length > 0 ? profile.conditions.join(', ') : 'None';
        const equipment = 'Home workout, No equipment'; // Default for now, can be added to settings later

        console.log(`Generating workout for goal: ${goal}, activity: ${activity}`);

        const prompt = `
            Act as an expert Personal Trainer. Create a 1-day home workout routine for a person with:
            - Goal: ${goal}
            - Activity Level: ${activity}
            - Physical Conditions: ${conditions}
            - Equipment: ${equipment}

            Return ONLY a valid JSON object with this structure:
            {
                "warmup": ["activity 1", "activity 2"],
                "exercises": [
                    { "name": "Exercise Name", "sets": "3", "reps": "12", "rest": "60s", "tips": "Focus on form" }
                ],
                "cooldown": ["activity 1", "activity 2"],
                "duration": "45 mins",
                "focus": "Full Body/Upper/Lower"
            }
            Ensure the workout is safe and appropriate for their conditions.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        console.log("Only Raw AI Response:", text);
        text = cleanJSON(text);
        
        const workoutPlan = JSON.parse(text);

        // Save to user profile
        const updatedProfile = { ...profile, workoutPlan, lastWorkoutGen: new Date().toISOString().split('T')[0] };
        await User.update({ profile: updatedProfile }, { where: { id: req.user.id } });

        res.json(workoutPlan);

    } catch (error) {
        console.error('Workout Gen Error:', error);
        
        // Fallback Plan
        const fallback = {
            warmup: ["Jumping Jacks - 1 min", "Arm Circles - 30s"],
            exercises: [
                { name: "Push-ups", sets: "3", reps: "10-12", rest: "60s", tips: "Keep back straight" },
                { name: "Squats", sets: "3", reps: "15", rest: "60s", tips: "Knees behind toes" },
                { name: "Plank", sets: "3", reps: "30-45s", rest: "60s", tips: "Engage core" }
            ],
            cooldown: ["Child's Pose", "Toe Touch Stretch"],
            duration: "20 mins",
            focus: "Full Body Essentials"
        };
        res.json(fallback);
    }
});

// Get Current Workout
router.get('/today', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const plan = user?.profile?.workoutPlan;
        
        if (plan) {
            res.json(plan);
        } else {
            res.json(null);
        }
    } catch (error) {
        console.error("Get Workout Error", error);
        res.status(500).json({ error: "Failed to fetch workout" });
    }
});

module.exports = router;
