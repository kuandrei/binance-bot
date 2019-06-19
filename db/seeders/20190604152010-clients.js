'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Clients', [{
            name: 'Andrei',
            status: 'ACTIVE',
            apiKey: 'PimunEQGFrVyUBWIMX6ZZIA8Cua3gh6KFX8isZm9QvxCPsprzA2mhQuSBhXl0vaM',
<<<<<<< HEAD
            apiSecret: '8w42FOPWvB0P3jmAlzp2NoJhUW5CiqaHTVysVVF5wjQofEo3d0rw95U4Nng6YWZb',
            commission: 0.00075,
=======
            apiSecret: '**************************************************************',
            commission: 0.0075,
>>>>>>> aade905ac1044fd8c2f10cd61a0510a23676a6e2
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Clients', null, {});
    }
};
