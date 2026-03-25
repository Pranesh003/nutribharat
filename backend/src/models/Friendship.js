const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    friendId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'friendId']
        }
    ]
});

module.exports = Friendship;
