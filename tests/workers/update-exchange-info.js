require('chai').should();

const {ExchangeInfo} = require('../../app/models');
const exchangeInfoWorker = require('./../../app/workers/update-exchage-info');

describe('Update exchange info worker', function () {

    it.only('Run worker on empty database and check that was filled out', async function () {
        // truncate db
        await ExchangeInfo.destroy({truncate: true});
        // run worker
        await exchangeInfoWorker();
        // check db is restored
        const count = await ExchangeInfo.count();
        count.should.be.gt(100);
    });
});
