require('chai').should();

const {ExchangeInfo} = require('../../app/models');
const exchangeInfoWorker = require('../../app/workers/update-exchange-info');

describe('test update exchange info worker', function () {

    it('should fill out the exchange info table', async function () {
        // truncate db
        await ExchangeInfo.destroy({truncate: true});
        // run worker
        await exchangeInfoWorker();
        // check db is restored
        const count = await ExchangeInfo.count();
        count.should.be.gt(100);
    });
});
