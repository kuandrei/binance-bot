'use strict';
module.exports = (sequelize, DataTypes) => {
    const TradeRuleCondition = sequelize.define('TradeRuleCondition', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(128)
        },
        interval: {
            allowNull: false,
            type: DataTypes.ENUM('1m', '3m', '5m', '15m', '30m')
        },
        indicator: {
            allowNull: false,
            type: DataTypes.ENUM('CandlestickPattern', 'MACD')
        },
        filter: {
            allowNull: false,
            type: DataTypes.JSON
        }
    }, {});
    TradeRuleCondition.associate = function ({TradeRule}) {
        TradeRuleCondition.belongsTo(TradeRule, {foreignKey: 'tradeRuleId'});
    };
    return TradeRuleCondition;
};