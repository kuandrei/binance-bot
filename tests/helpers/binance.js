require('chai').should();

const binanceHelpers = require('../../app/helpers/binance');
const testClientId = 1;

describe('test binance helpers', function () {

    it('test ping api - should return true', async function () {
        const binanceApiClient = await binanceHelpers.initApiClient(testClientId);
        const result = await binanceApiClient.ping();
        result.should.equal(true);
    });

    it('test accountInfo api - should return account info', async function () {
        const binanceApiClient = await binanceHelpers.initApiClient(testClientId);
        const result = await binanceApiClient.accountInfo();
        result.should.include.keys(['canTrade', 'canWithdraw', 'balances']);
        result.canTrade.should.equal(true);
    });

    it('test symbolMarketPrice api with single symbol - should return symbol market price', async function () {
        const result = await binanceHelpers.symbolMarketPrice('BTCUSDT');
        result.should.be.a('number');
    });

    it('test symbolMarketPrice api with multiple symbols - should return list prices', async function () {
        const results = await binanceHelpers.symbolMarketPrice(['BTCUSDT', 'BNBBTC', 'BNBUSDT']);
        results.should.be.an('array');
        results[0].should.include.keys('symbol', 'marketPrice');
    });

    it('test getClientBalances api - should return client balances', async function () {
        const balances = await binanceHelpers.getClientBalances(testClientId);
        balances.should.be.an('array');
        balances.length.should.be.gt(1);
        balances[0].should.include.keys(['asset', 'free', 'locked']);
    });

    it('test allOrders api - should return list of all client orders', async function () {
        const orders = await binanceHelpers.allOrders(testClientId, 'BTCUSDT');
        orders.should.be.an('array');
    });

    it('test getOrder api - should return order details', async function () {
        const order = await binanceHelpers.getOrder(testClientId, 'BNBBTC', 202532259);
        order.should.be.an('object');
        order.should.include.keys('symbol', 'orderId');
    });

    it('test getCandles api - should return candle list', async function () {
        const candles = await binanceHelpers.getCandles({
            symbol: 'BTCUSDT',
            interval: '3m',
            limit: 10
        });
        candles.should.be.an('array');
        candles.length.should.equal(10);
    });

});
