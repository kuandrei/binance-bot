'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('CurrencyPairs', [{
            symbol: 'BTCUSDT',
            firstCurrency: 'BTC',
            firstCurrencyPrecision: 6,
            secondCurrency: 'USDT',
            secondCurrencyPrecision: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            symbol: 'BNBBTC',
            firstCurrency: 'BNB',
            firstCurrencyPrecision: 6,
            secondCurrency: 'BTC',
            secondCurrencyPrecision: 6,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            symbol: 'BNBUSDT',
            firstCurrency: 'BNB',
            firstCurrencyPrecision: 6,
            secondCurrency: 'USDT',
            secondCurrencyPrecision: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('CurrencyPairs', null, {});
    }
};
