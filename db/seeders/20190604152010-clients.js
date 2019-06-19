'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Clients', [{
            name: 'Andrei',
            status: 'ACTIVE',
            apiKey: 'PimunEQGFrVyUBWIMX6ZZIA8Cua3gh6KFX8isZm9QvxCPsprzA2mhQuSBhXl0vaM',
            apiSecret: '8w42FOPWvB0P3jmAlzp2NoJhUW5CiqaHTVysVVF5wjQofEo3d0rw95U4Nng6YWZb',
            commission: 0.00075,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Clients', null, {});
    }
};
