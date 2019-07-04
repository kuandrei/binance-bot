'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('TradePairs', 'tradeOn', {
            allowNull: false,
            type: Sequelize.ENUM('UPTREND', 'DOWNTREND'),
            defaultValue: 'UPTREND',
            after: 'symbol'
        });
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn('TradePairs', 'tradeOn');
    }
};
