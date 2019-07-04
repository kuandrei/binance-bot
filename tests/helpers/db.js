require('chai').should();

const dbHelpers = require('../../app/helpers/db');

describe('test db helpers', function () {

    it('test getTradingSymbols function - should return symbols array', async function () {
        const symbols = await dbHelpers.getTradingSymbols();
        symbols.should.be.an('array');
    });

    it('test findNewProfitDeals function - should return deals array', async function () {
        const deals = await dbHelpers.findNewProfitDeals('UPTREND')('BTCUSDT', 1000000);
        deals.should.be.an('array');
    });

    it('test findNewProfitDeals function - should return deals array', async function () {
        const deals = await dbHelpers.findNewProfitDeals('DOWNTREND')('BTCUSDT', 1);
        deals.should.be.an('array');
    });

    it('test findOpenStopLossOrder function - should return deals array', async function () {
        const deals = await dbHelpers.findOpenStopLossOrder('BTCUSDT', 20000);
        deals.should.be.an('array');
    });

    it('test getMinProfitPrice function - should return number', async function () {
        const result = await dbHelpers.getMinProfitPrice(1, 'BTCUSDT');
        result.should.be.a('number');
    });

    it('test getNumberOfOpenAlgoOrders function - should return number', async function () {
        const result = await dbHelpers.getNumberOfOpenAlgoOrders(1, 'BTCUSDT');
        result.should.be.a('number');
    });

    it('test getExchangeInfoMap function - should return number', async function () {
        const results = await dbHelpers.getExchangeInfoMap(['BTCUSDT', 'BNBUSDT', 'BNBBTC']);
        results.should.be.an('object');
        results.should.contain.keys('BTCUSDT', 'BNBUSDT', 'BNBBTC');
        results.BTCUSDT.should.be.an('object');
        results.BTCUSDT.should.contain.keys('symbol', 'baseAsset', 'quoteAsset');
    });

});
