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
    TradeRule.associate = function (models) {
        TradeRule.belongsTo(models.Client, {as: 'client'});
        TradeRule.hasMany(models.TradeRuleCondition, {as: 'conditions', foreignKey: 'tradeRuleId'});
        TradeRule.belongsToMany(models.TradePair, {
            through: models.TradePairRule
        });
    };
    return TradeRule;
};