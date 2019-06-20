'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('Deals', 'closePrice', {
            type: Sequelize.DECIMAL(16, 8),
            defaultValue: 0,
            after: 'openPrice'
        });
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn('Deals', 'closePrice');

    }
};
