const express = require('express');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const { authenticateToken } = require('../middleware/auth');
// Native fetch is available in Node 22
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const router = express.Router();

// Get Profile
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile (Safe Merge)
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { profile } = req.body;
        const user = await User.findByPk(req.user.id);

        // Merge existing profile with new data
        const currentProfile = user.profile || {};
        const updatedProfile = { ...currentProfile, ...profile };

        await User.update({ profile: updatedProfile }, { where: { id: req.user.id } });

        // Helper to remove password from response
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });
        res.json(updatedUser);
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



// Log User Behavior & Steps
router.post('/log', authenticateToken, async (req, res) => {
    try {
        const { meal, status, date, steps, weight } = req.body;
        const logDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        // Find or Create Daily Log
        let [dailyLog, created] = await DailyLog.findOrCreate({
            where: { userId: req.user.id, date: logDate },
            defaults: {
                mealPlan: {}, // Will fetch from User profile if needed later? Or should ideally copy snapshot
                consumptionLogs: {},
                steps: 0,
                water: 0
            }
        });

        // Update Steps
        if (steps !== undefined) {
            dailyLog.steps = steps;
            await dailyLog.save();

            // Also update main profile for "current" view if it's today
            const today = new Date().toISOString().split('T')[0];
            if (logDate === today) {
                const user = await User.findByPk(req.user.id);
                let currentProfile = user.profile || {};
                currentProfile.dailySteps = steps;
                await User.update({ profile: currentProfile }, { where: { id: req.user.id } });
            }
            return res.json({ success: true, steps });
        }

        // Update Weight
        if (weight !== undefined) {
            dailyLog.weight = parseFloat(weight);
            await dailyLog.save();

            // Update user profile current weight
            const user = await User.findByPk(req.user.id);
            let currentProfile = user.profile || {};
            currentProfile.weight = parseFloat(weight);
            await User.update({ profile: currentProfile }, { where: { id: req.user.id } });

            return res.json({ success: true, weight });
        }

        // Update Meal Status
        if (meal && status) {
            const currentLogs = dailyLog.consumptionLogs || {};
            currentLogs[meal] = status;

            // Generate Insight
            let insight = null;
            if (status === 'skipped') {
                const skips = Object.values(currentLogs).filter(s => s === 'skipped').length;
                if (skips >= 2) insight = "Insight: Multiple skips detected today. Try a quick smoothie to stay fueled!";
            } else if (status === 'eaten') {
                const eatenCount = Object.values(currentLogs).filter(s => s === 'eaten').length;
                if (eatenCount >= 3) insight = "Great consistency! You're hitting your nutrition targets.";
            }

            dailyLog.consumptionLogs = currentLogs;
            dailyLog.insight = insight || dailyLog.insight;
            await DailyLog.update({ consumptionLogs: currentLogs, insight: dailyLog.insight }, { where: { id: dailyLog.id } });

            return res.json({ success: true, insight });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Log Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get History for a Date
router.get('/history/:date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.params; // Format YYYY-MM-DD
        const log = await DailyLog.findOne({ where: { userId: req.user.id, date } });

        if (!log) return res.json({
            found: false,
            message: "No logs for this date. Go back to dashboard to generate plan."
        });

        res.json({ found: true, data: log });
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export Full History
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const logs = await DailyLog.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
