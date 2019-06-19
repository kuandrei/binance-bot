require('chai').should();

const binanceHelpers = require('../../app/helpers/binance');
const testClientId = 1;

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

    it('Test symbolMarketPrice helper with one symbol', async function () {
        const result = await binanceHelpers.symbolMarketPrice('BTCUSDT');
        result.should.be.a('number');
    });

    it('Test symbolMarketPrice helper with array of symbols', async function () {
        const results = await binanceHelpers.symbolMarketPrice(['BTCUSDT', 'BNBBTC', 'BNBUSDT']);
        results.should.be.an('array');
        results[0].should.include.keys('symbol', 'marketPrice');
    });

    it('Test getClientBalances helper', async function () {
        const balances = await binanceHelpers.getClientBalances(testClientId);
        balances.should.be.an('array');
        balances.length.should.be.gt(1);
        balances[0].should.include.keys(['asset', 'free', 'locked']);
    });

    it('Test allOredrs helper', async function () {
        const orders = await binanceHelpers.allOrders(testClientId, 'BTCUSDT');
        orders.should.be.an('array');
    });

    it('Test getOrder helper', async function () {
        const order = await binanceHelpers.getOrder(testClientId, 'BTCUSDT', 440652233);
        order.should.be.an('object');
        order.should.include.keys('symbol', 'orderId');
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
