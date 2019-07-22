'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('TradePairRules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER(11).UNSIGNED
            },
            tradePairId: {
                allowNull: false,
                type: Sequelize.INTEGER(11).UNSIGNED,
                references: {
                    model: 'TradePairs',
                    key: 'id'
                },
            },
            tradeRuleId: {
                allowNull: false,
                type: Sequelize.INTEGER(11).UNSIGNED,
                references: {
                    model: 'TradeRules',
                    key: 'id'
                },
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('TradePairRules');
    }
};