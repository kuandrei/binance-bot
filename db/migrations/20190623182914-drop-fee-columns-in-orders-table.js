'use strict';

module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn('Orders', 'fee'),
            queryInterface.removeColumn('Orders', 'feeCurrency')
        ]);
    },

    down: () => {
    }
};
