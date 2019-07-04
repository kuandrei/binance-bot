require('chai').should();

const dbHelper = require('../../app/helpers/db');

describe('test db helpers', function () {

    it('test getTradingSymbols function - should return symbols array', async function () {
        const symbols = await dbHelper.getTradingSymbols();
        symbols.should.be.an('array');
    });

    it('test findNewProfitDeals function - should return deals array', async function () {
        const deals = await dbHelper.findNewProfitDeals('UPTREND')('BTCUSDT', 1000000);
        deals.should.be.an('array');
    });

    it('test findNewProfitDeals function - should return deals array', async function () {
        const deals = await dbHelper.findNewProfitDeals('DOWNTREND')('BTCUSDT', 1);
        deals.should.be.an('array');
    });

    it('test findOpenStopLossOrder function - should return deals array', async function () {
        const orders = await dbHelper.findOpenStopLossOrder('BTCUSDT', 20000);
        orders.should.be.an('array');
    });

    it('test findOpenTakeProfitOrder function - should return deals array', async function () {
        const orders = await dbHelper.findOpenTakeProfitOrder('BTCUSDT', 20000);
        orders.should.be.an('array');
    });

    it('test getMinProfitPrice function - should return number', async function () {
        const result = await dbHelper.getMinProfitPrice(1, 'BTCUSDT');
        result.should.be.a('number');
    });

    it('test getNumberOfOpenAlgoOrders function - should return number', async function () {
        const result = await dbHelper.getNumberOfOpenAlgoOrders(1, 'BTCUSDT');
        result.should.be.a('number');
    });

    it('test getExchangeInfoMap function - should return number', async function () {
        const results = await dbHelper.getExchangeInfoMap(['BTCUSDT', 'BNBUSDT', 'BNBBTC']);
        results.should.be.an('object');
        results.should.contain.keys('BTCUSDT', 'BNBUSDT', 'BNBBTC');
        results.BTCUSDT.should.be.an('object');
        results.BTCUSDT.should.contain.keys('symbol', 'baseAsset', 'quoteAsset');
    });

});
