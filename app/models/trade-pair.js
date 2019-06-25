'use strict';
module.exports = (sequelize, DataTypes) => {
    const TradePair = sequelize.define('TradePair', {
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
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
        }
    }, {});
    TradePair.associate = function ({Client}) {
        TradePair.belongsTo(Client, {as: 'client'});
    };
    return TradePair;
};