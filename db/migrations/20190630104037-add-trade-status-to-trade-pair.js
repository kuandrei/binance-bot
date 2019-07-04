'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('TradePairs', 'tradeStatus', {
            type: Sequelize.STRING(512),
            after: 'profitIn'
        });
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn('TradePairs', 'tradeStatus');
    }
};
