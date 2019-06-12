require('chai').should();

const server = require('../../app/server');
const binanceHelpers = require('../../app/helpers/binance');
const testClientId = 1;

before((done) => {
    if (server.started)
        return done();
    server.once('started', done);
});

describe('Binance helpers', function () {

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

    it('Test symbolMarketPrice helper', async function () {
        const result = await binanceHelpers.symbolMarketPrice('BTCUSDT');
        result.should.be.a('number');
    });

    it('Test getClientBalances helper', async function () {
        const balances = await binanceHelpers.getClientBalances(testClientId);
        balances.should.be.an('array');
        balances.length.should.be.gt(1);
        balances[0].should.include.keys(['asset', 'free', 'locked']);
    });

    it('Test getCandles helper', async function () {
        const candles = await binanceHelpers.getCandles({
            symbol: 'BTCUSDT',
            interval: '3m',
            limit: 10
        });
        candles.should.be.an('array');
        candles.length.should.equal(10);
    });

});
