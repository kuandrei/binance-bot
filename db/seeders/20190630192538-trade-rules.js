'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('TradeRules', [{
            id: 1,
            clientId: 1,
            name: 'MACD-SLC/PATTERN:1m (*,*,*,*,P), 3m (N,N,N,N,P), 5m (N,N,N,N,N)',
            status: 'ACTIVE',
            type: 'BUY',
            conditionMatch: 'ALL',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 2,
            clientId: 1,
            name: 'MACD-SLC/PATTERN:1m (*,*,*,*,N), 3m (P,P,P,P,N), 5m (P,P,P,P,P)',
            status: 'ACTIVE',
            type: 'SELL',
            conditionMatch: 'ALL',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 3,
            clientId: 1,
            name: 'MACD-SLC/5m/BEARISH',
            status: 'ACTIVE',
            type: 'SELL',
            conditionMatch: 'ALL',
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});

        await queryInterface.bulkInsert('TradeRuleConditions', [{
            tradeRuleId: 1,
            name: '1m (*,*,*,*,P)',
            interval: '1m',
            indicator: 'MACD',
            filter: JSON.stringify({
                PATTERN: {
                    like: '%,P'
                }
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            tradeRuleId: 1,
            name: '3m (N,N,N,N,P)',
            interval: '3m',
            indicator: 'MACD',
            filter: JSON.stringify({
                PATTERN: 'N,N,N,N,P'
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            tradeRuleId: 1,
            name: '5m (N,N,N,N,N)',
            interval: '5m',
            indicator: 'MACD',
            filter: JSON.stringify({
                PATTERN: 'N,N,N,N,N'
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            tradeRuleId: 2,
            name: '1m (*,*,*,*,N)',
            interval: '1m',
            indicator: 'MACD',
            filter: JSON.stringify({
                PATTERN: {
                    like: '%,N'
                }
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            tradeRuleId: 2,
            name: '3m (P,P,P,P,N)',
            interval: '3m',
            indicator: 'MACD',
            filter: JSON.stringify({
                PATTERN: 'P,P,P,P,N'
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            tradeRuleId: 2,
            name: '5m (P,P,P,P,P)',
            interval: '5m',
            indicator: 'MACD',
            filter: JSON.stringify({
                PATTERN: 'P,P,P,P,P'
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            tradeRuleId: 3,
            name: '5m/MACD/SLC/BEARISH',
            interval: '5m',
            indicator: 'MACD',
            filter: JSON.stringify({
                SLC: true,
                SLC_TYPE: 'BEARISH'
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.bulkDelete('People', null, {});
        */
    }
};
