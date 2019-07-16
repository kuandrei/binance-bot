'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('TradeRuleConditions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER(11).UNSIGNED
            },
            tradeRuleId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                references: {
                    model: 'TradeRules',
                    key: 'id'
                },
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING(128)
            },
            interval: {
                allowNull: false,
                type: Sequelize.ENUM(
                    '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'
                )
            },
            indicator: {
                allowNull: false,
                type: Sequelize.ENUM('CandlestickPattern', 'MACD', 'RSI')
            },
            filter: {
                allowNull: false,
                type: Sequelize.JSON
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('TradeRuleConditions');
    }
};