'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('TradePairs', [{
            symbol: 'BTCUSDT',
            status: 'ACTIVE',
            dealQty: 0.002,
            additionPercentage: 0.03, // 3%
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            symbol: 'BNBBTC',
            status: 'INACTIVE',
            dealQty: 1,
            additionPercentage: 0.03, // 3%
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
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
