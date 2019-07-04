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
                type: Sequelize.ENUM('1m', '3m', '5m', '15m', '30m')
            },
            indicator: {
                allowNull: false,
                type: Sequelize.ENUM('CandlestickPattern', 'MACD')
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