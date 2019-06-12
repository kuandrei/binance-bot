'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('TradePairs', [{
            clientId: 1,
            symbol: 'BTCUSDT',
            status: 'ACTIVE',
            dealQty: 0.002,
            additionPercentage: 0.03, // 3%
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            clientId: 1,
            symbol: 'BNBBTC',
            status: 'INACTIVE',
            dealQty: 1,
            additionPercentage: 0.03, // 3%
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            clientId: 1,
            symbol: 'BNBUSDT',
            status: 'INACTIVE',
            dealQty: 1,
            additionPercentage: 0.03, // 3%
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('TradePairs', null, {});
    }
};
