require('chai').should();

const server = require('./../app/server');
const binanceHelpers = require('./../app/helpers/binance');
const testClientId = 1;


before(function (done) {
    if (server.started) {
        return done();
    }
    server.once('started', done);

});


describe('Binance helper', function () {

    it('Test public api - ping', async function () {
        const binanceApiClient = await binanceHelpers.initApiClient(testClientId);
        const result = await binanceApiClient.ping();
        result.should.equal(true);
    });

    it('Test private/authenticated api - accountInfo', async function () {
        const binanceApiClient = await binanceHelpers.initApiClient(testClientId);
        const result = await binanceApiClient.accountInfo();
        result.should.include.keys(['canTrade', 'canWithdraw', 'balances']);
        result.canTrade.should.equal(true);
    });

    it.only('Test symbolMarketPrice helper', async function () {
        const result = await binanceHelpers.symbolMarketPrice('BTCUSDT');

        console.log('-----------------------------');
        console.dir({'BTCUSDT': result}, {colors: true, depth: 5});
        console.log('-----------------------------');
        // result.should.include.keys(['canTrade', 'canWithdraw', 'balances']);
        // result.canTrade.should.equal(true);
    });

});
