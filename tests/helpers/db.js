require('chai').should();

const server = require('../../app/server');
const dbHelpers = require('../../app/helpers/db');

before((done) => {
    if (server.started)
        return done();
    server.once('started', done);
});

describe('DB helpers', function () {

    it('getActiveSymbols', async function () {
        const symbols = await dbHelpers.getActiveSymbols();
        symbols.should.be.an('array');
    });

    it('findNewProfitDeals', async function () {
        const deals = await dbHelpers.findNewProfitDeals('BTCUSDT', 20000);
        deals.should.be.an('array');
    });

});
