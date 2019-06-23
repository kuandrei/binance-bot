'use strict';
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ExchangeInfo', {
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('TRADING', 'BREAK')
        },
        baseAsset: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        baseAssetPrecision: {
            allowNull: false,
            type: DataTypes.INTEGER(3).UNSIGNED
        },
        quoteAsset: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        quotePrecision: {
            allowNull: false,
            type: DataTypes.INTEGER(3).UNSIGNED
        },
        orderTypes: {
            allowNull: false,
            type: DataTypes.JSON
        },
        icebergAllowed: DataTypes.BOOLEAN,
        isSpotTradingAllowed: DataTypes.BOOLEAN,
        isMarginTradingAllowed: DataTypes.BOOLEAN,
        filters: DataTypes.JSON
    }, {tableName: 'ExchangeInfo'});
};