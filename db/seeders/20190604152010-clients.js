'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Clients', [{
            name: 'Andrei',
            status: 'ACTIVE',
            apiKey: 'PimunEQGFrVyUBWIMX6ZZIA8Cua3gh6KFX8isZm9QvxCPsprzA2mhQuSBhXl0vaM',
            apiSecret: '**************************************************************',
            commission: 0.0075,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Clients', null, {});
    }
};
