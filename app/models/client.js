'use strict';
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(128),
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            defaultValue: 'ACTIVE'
        },
        apiKey: {
            allowNull: false,
            type: DataTypes.STRING(128),
        },
        apiSecret: {
            allowNull: false,
            type: DataTypes.STRING(128)
        },
        commission: {
            allowNull: false,
            type: DataTypes.DECIMAL(6, 6)
        }
    }, {});
    Client.associate = function (models) {
        Client.hasMany(models.Order, {as: 'orders', foreignKey: 'clientId'});
        Client.hasMany(models.TradePair, {as: 'trade-pairs', foreignKey: 'clientId'});
        Client.hasMany(models.Deal, {as: 'deals', foreignKey: 'clientId'});
        Client.hasMany(models.TradeRule, {as: 'rules', foreignKey: 'clientId'});
    };
    return Client;
};