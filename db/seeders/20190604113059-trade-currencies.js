'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('TradePairs', [{
            symbol: 'BTCUSDT',
            firstCurrency: 'BTC',
            firstCurrencyPrecision: 8,
            secondCurrency: 'USDT',
            secondCurrencyPrecision: 2,
            commission: 0.0010,
            commissionType: 'STANDARD',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            symbol: 'BNBBTC',
            firstCurrency: 'BNB',
            firstCurrencyPrecision: 8,
            secondCurrency: 'BTC',
            secondCurrencyPrecision: 8,
            commission: 0.0005,
            commissionType: 'FIRST_CURRENCY',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            symbol: 'BNBUSDT',
            firstCurrency: 'BNB',
            firstCurrencyPrecision: 8,
            secondCurrency: 'USDT',
            secondCurrencyPrecision: 2,
            commission: 0.0005,
            commissionType: 'FIRST_CURRENCY',
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('TradePairs', null, {});
    }
};
