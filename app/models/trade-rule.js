'use strict';
module.exports = (sequelize, DataTypes) => {
    const TradeRule = sequelize.define('TradeRule', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(128)
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE')
        },
        type: {
            allowNull: false,
            type: DataTypes.ENUM('BUY', 'SELL')
        },
        conditionMatch: {
            allowNull: false,
            type: DataTypes.ENUM('ANY', 'ALL'),
            defaultValue: 'ALL'
        }
    }, {});
    TradeRule.associate = function ({Client, TradeRuleCondition}) {
        TradeRule.belongsTo(Client, {as: 'client'});
        TradeRule.hasMany(TradeRuleCondition, {as: 'conditions', foreignKey: 'tradeRuleId'});
    };
    return TradeRule;
};