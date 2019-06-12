'use strict';
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CurrencyPair', {
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
        },
        firstCurrency: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        firstCurrencyPrecision: {
            allowNull: false,
            type: DataTypes.INTEGER(3).UNSIGNED
        },
        secondCurrency: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        secondCurrencyPrecision: {
            allowNull: false,
            type: DataTypes.INTEGER(3).UNSIGNED
        }
    }, {});
};