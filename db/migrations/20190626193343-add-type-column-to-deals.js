'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('Deals', 'type', {
            allowNull: false,
            type: Sequelize.ENUM('BULLISH', 'BEARISH'),
            after: 'symbol',
            defaultValue: 'BULLISH'
        });
    },

    down: (queryInterface) => {
        queryInterface.removeColumn('Deals', 'type');
    }
};
