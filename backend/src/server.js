require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workout', require('./routes/workout'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/social', require('./routes/social'));

// Health Check
app.get('/', (req, res) => {
    res.send('NutriBharat AI API is running...');
});

// Sync Database & Start Server
const startServer = async () => {
    try {
        await sequelize.sync({ alter: true }); // Set force: true to drop tables on restart dev
        console.log('✅ Database connected & synced.');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database connection error:', error);
    }
};

startServer();

// Keep alive
setInterval(() => { }, 1000);

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
