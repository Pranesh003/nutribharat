const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DailyLog = sequelize.define('DailyLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING, // Format: YYYY-MM-DD
        allowNull: false
    },
    mealPlan: {
        type: DataTypes.JSON, // Full meal plan snapshot for that day
        allowNull: true
    },
    consumptionLogs: {
        type: DataTypes.JSON, // { breakfast: 'eaten', lunch: 'skipped', ... }
        allowNull: true
    },
    steps: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    water: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    insight: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'date']
        }
    ]
});


module.exports = DailyLog;
