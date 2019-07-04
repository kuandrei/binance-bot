'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('TradeRestrictions', [{
            clientId: 1,
            name: 'max 5 open deals ',
            filter: JSON.stringify({
                openDeals: {
                    gte: 5
                }
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            clientId: 1,
            name: 'max 3 open deals in 0.1% range',
            filter: JSON.stringify({
                openDealsInRange_1: {
                    gte: 3
                }
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            clientId: 1,
            name: 'max 5 open deals in 0.5% range',
            filter: JSON.stringify({
                openDealsInRange_5: {
                    gte: 5
                }
            }),
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('TradeRestrictions', null, {});
    }
};
