const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const DailyLog = require('../models/DailyLog');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Send Friend Request
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;
        const friend = await User.findOne({ where: { email } });
        
        if (!friend) return res.status(404).json({ error: 'User not found' });
        if (friend.id === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

        const exists = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { userId: req.user.id, friendId: friend.id },
                    { userId: friend.id, friendId: req.user.id }
                ]
            }
        });

        if (exists) return res.status(400).json({ error: 'Request already exists or already friends' });

        await Friendship.create({
            userId: req.user.id,
            friendId: friend.id,
            status: 'pending'
        });

        res.json({ success: true, message: 'Request sent' });

    } catch (error) {
        console.error("Friend Request Error", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get My Friends & Requests
router.get('/friends', authenticateToken, async (req, res) => {
    try {
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { userId: req.user.id },
                    { friendId: req.user.id }
                ]
            }
        });

        const friendList = [];
        const pendingRequests = [];

        for (const f of friendships) {
            let otherId = f.userId === req.user.id ? f.friendId : f.userId;
            const otherUser = await User.findByPk(otherId, { attributes: ['id', 'name', 'email', 'profile'] });
            
            if (f.status === 'accepted') {
                friendList.push(otherUser);
            } else if (f.status === 'pending' && f.friendId === req.user.id) {
                pendingRequests.push({ ...otherUser.dataValues, requestId: f.id });
            }
        }

        res.json({ friends: friendList, requests: pendingRequests });

    } catch (error) {
        console.error("Get Friends Error", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Accept Request
router.post('/accept', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.body;
        await Friendship.update({ status: 'accepted' }, { where: { id: requestId, friendId: req.user.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Feed (Recent Activity of Friends)
router.get('/feed', authenticateToken, async (req, res) => {
    try {
        // Get friend IDs
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [{ userId: req.user.id }, { friendId: req.user.id }]
            }
        });
        
        const friendIds = friendships.map(f => f.userId === req.user.id ? f.friendId : f.userId);
        friendIds.push(req.user.id); // Include self

        const today = new Date().toISOString().split('T')[0];
        const logs = await DailyLog.findAll({
            where: {
                userId: { [Op.in]: friendIds },
                date: today
            },
            limit: 20,
            order: [['updatedAt', 'DESC']]
        });

        const feed = [];
        for (const log of logs) {
            const user = await User.findByPk(log.userId, { attributes: ['name'] });
            
            if (log.steps > 5000) feed.push({ user: user.name, action: `walked ${log.steps} steps!`, time: log.updatedAt });
            if (log.consumptionLogs && Object.values(log.consumptionLogs).includes('eaten')) {
                feed.push({ user: user.name, action: `completed their meal plan!`, time: log.updatedAt });
            }
             if (log.weight) feed.push({ user: user.name, action: `logged their weight check-in!`, time: log.updatedAt });
        }

        res.json(feed);

    } catch (error) {
        console.error("Feed Error", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
     try {
        // Get friend IDs
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [{ userId: req.user.id }, { friendId: req.user.id }]
            }
        });
        
        const friendIds = friendships.map(f => f.userId === req.user.id ? f.friendId : f.userId);
        friendIds.push(req.user.id);

        const today = new Date().toISOString().split('T')[0];
        
        // Simple leaderboard by Steps for today
        const logs = await DailyLog.findAll({
             where: {
                userId: { [Op.in]: friendIds },
                date: today
            },
            order: [['steps', 'DESC']]
        });
        
        const leaderboard = [];
        for (const log of logs) {
             const user = await User.findByPk(log.userId, { attributes: ['name'] });
             leaderboard.push({ name: user.name, score: log.steps, metric: 'Steps' });
        }
        
        res.json(leaderboard);

    } catch (error) {
         console.error("Leaderboard Error", error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
