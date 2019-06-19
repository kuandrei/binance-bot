'use strict';
module.exports = (sequelize, DataTypes) => {
    const Deal = sequelize.define('Deal', {
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
        },
        openPrice: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        quantity: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        minProfitPrice: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('NEW', 'OPEN', 'CLOSED', 'CANCELED', 'ERROR'),
            defaultValue: 'NEW'
        },
        algorithm: {
            type: DataTypes.STRING(512),
            defaultValue: 'MANUAL'
        }
    }, {});
    Deal.associate = function ({Client, Order}) {
        Deal.belongsTo(Client, {as: 'client'});
        Deal.hasMany(Order, {as: 'orders', foreignKey: 'dealId'});
    };
    return Deal;
};