'use strict';
module.exports = (sequelize, DataTypes) => {
    const TradePair = sequelize.define('TradePair', {
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
        },
        tradeOn: {
            allowNull: false,
            type: DataTypes.ENUM('UPTREND', 'DOWNTREND'),
            defaultValue: 'UPTREND'
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            defaultValue: 'ACTIVE'
        },
        dealQty: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        minProfitRate: {
            allowNull: false,
            type: DataTypes.DECIMAL(6, 4)
        },
        profitIn: {
            allowNull: false,
            type: DataTypes.ENUM('BASE_ASSET', 'QUOTE_ASSET'),
            defaultValue: 'BASE_ASSET'
        },
        tradeStatus: {
            type: DataTypes.STRING(512)
        }
    }, {});
    TradePair.associate = function ({Client}) {
        TradePair.belongsTo(Client, {as: 'client'});
    };
    return TradePair;
};