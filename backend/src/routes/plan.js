const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to generate with fallback
async function generateWithFallback(prompt) {
    const models = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-2.5-flash"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error(`Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError;
}

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

router.post('/generate', authenticateToken, async (req, res) => {
    let user;
    try {
        user = await User.findByPk(req.user.id);
        const profile = user ? user.profile : {}; // Safe access

        // Default values if profile is incomplete
        const cuisine = profile?.cuisine || 'North Indian';
        const preference = profile?.preference || 'vegetarian';
        const calories = profile?.tdee || 2000;
        const conditions = profile?.conditions && profile.conditions.length > 0 ? profile.conditions.join(', ') : 'None';

        // Create Prompt
        const prompt = `
            Act as an expert Indian Nutritionist. Generate a 1-day meal plan for a person with the following profile:
            - Cuisine Preference: ${cuisine}
            - Diet Type: ${preference}
            - Calorie Target: ${calories} kcal
            - Medical Conditions: ${conditions}

            Return ONLY a valid JSON object (no markdown, no extra text) with the following structure:
            {
                "breakfast": { "item": "Name of dish", "calories": number },
                "lunch": { "item": "Name of dish", "calories": number },
                "snack": { "item": "Name of dish", "calories": number },
                "dinner": { "item": "Name of dish", "calories": number }
            }
            
            Ensure the total calories sum up to approximately ${calories}. Use specific regional dishes matching the cuisine.
        `;

        let text = await generateWithFallback(prompt);
        console.log("🤖 Gemini Raw Response:", text); // Debug log
        text = cleanJSON(text);

        const mealPlan = JSON.parse(text);

        // Save to user profile
        const updatedProfile = { ...profile, mealPlan };
        await User.update({ profile: updatedProfile }, { where: { id: req.user.id } });

        res.json(mealPlan);

    } catch (error) {
        console.error('AI Plan Gen Error:', error);

        // Fallback to static plan if AI fails
        console.log("⚠️ Switching to Static Fallback Plan");

        const fallbacks = [
            {
                "breakfast": { "item": "Masala Oats & Apple", "calories": 350 },
                "lunch": { "item": "Dal Tadka, Roti, Salad", "calories": 650 },
                "snack": { "item": "Roasted Chickpeas", "calories": 150 },
                "dinner": { "item": "Vegetable Khichdi", "calories": 400 }
            },
            {
                "breakfast": { "item": "Poha with Peanuts", "calories": 400 },
                "lunch": { "item": "Rajma Chawal", "calories": 700 },
                "snack": { "item": "Fruit Salad", "calories": 100 },
                "dinner": { "item": "Paneer Bhurji & Roti", "calories": 450 }
            },
            {
                "breakfast": { "item": "Idli Sambar", "calories": 300 },
                "lunch": { "item": "Curd Rice & Pickle", "calories": 500 },
                "snack": { "item": "Sprouts Salad", "calories": 200 },
                "dinner": { "item": "Dosa & Coconut Chutney", "calories": 450 }
            }
        ];

        const randomPlan = fallbacks[Math.floor(Math.random() * fallbacks.length)];

        // Save fallback to profile so it persists
        try {
            if (!user) user = await User.findByPk(req.user.id);
            if (user) {
                await User.update({ profile: { ...user.profile, mealPlan: randomPlan } }, { where: { id: req.user.id } });
            }
            console.log("Fallback plan returned successfully");
            return res.json(randomPlan);
        } catch (dbError) {
            console.error("Database save failed during fallback:", dbError);
            return res.status(500).json({ error: 'Failed to generate plan' });
        }
    }
});

// Generate Recipe Details
router.post('/recipe', authenticateToken, async (req, res) => {
    const { item, cuisine } = req.body;
    if (!item) return res.status(400).json({ error: 'Item name required' });

    try {
        console.log(`Generating recipe for: ${item} (${cuisine})`);
        const prompt = `
            Act as an expert Chef. Provide the recipe for "${item}" (${cuisine || 'Indian'} style).
            Return ONLY a valid JSON object:
            {
                "ingredients": ["list", "of", "ingredients", "with", "quantity"],
                "instructions": ["step 1", "step 2", ...]
            }
            Keep it simple and healthy.
        `;

        let text = await generateWithFallback(prompt);
        console.log("Recipe AI Response:", text);
        text = cleanJSON(text);

        const recipe = JSON.parse(text);
        res.json(recipe);

    } catch (error) {
        console.error("Recipe Gen Error:", error);
        // Robust Fallback
        res.json({
            ingredients: ["Ingredients not available offline", "Please check internet"],
            instructions: ["Cook with love!", "Ensure ingredients are fresh.", "Serve hot."]
        });
    }
});

// Generate Shopping List
router.post('/shopping-list', authenticateToken, async (req, res) => {
    const { mealPlan } = req.body;
    if (!mealPlan) return res.status(400).json({ error: 'Meal plan required' });

    try {
        const prompt = `
            Act as a Home Economist. Create a consolidated shopping list for this meal plan:
            ${JSON.stringify(mealPlan)}
            
            Return ONLY a valid JSON object with categories:
            {
                "Produce": ["item", "item"],
                "Dairy & Refrigerated": ["item"],
                "Grains & Spices": ["item"],
                "Other": ["item"]
            }
            Combine similar items (e.g. 2 onions).
        `;

        let text = await generateWithFallback(prompt);
        text = cleanJSON(text);

        const list = JSON.parse(text);
        res.json(list);

    } catch (error) {
        console.error("Shopping List Gen Error:", error);
        // Fallback for shopping list
        res.json({
            "Note": ["Could not generate list due to connection issues.", "Please check your meal plan manually."]
        });
    }
});

module.exports = router;

