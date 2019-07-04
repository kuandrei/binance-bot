'use strict';
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('SymbolInfo', {
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
        },
        marketPrice: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        candles: {
            allowNull: false,
            type: DataTypes.JSON
        },
        indicators: {
            allowNull: false,
            type: DataTypes.JSON
        },
        patterns: {
            allowNull: false,
            type: DataTypes.JSON
        }
    }, {tableName: 'SymbolInfo'});
};