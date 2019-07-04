require('chai').should();

const tradeHelper = require('../../app/helpers/trade');

describe('test trade helpers', function () {

    it('test calculateSymbolStopLossPrice function with single symbol - should return symbol market price', async function () {
        const result = await tradeHelper.calculateSymbolStopLossPrice('BTCUSDT');
        result.should.be.a('number');
    });

    it('test calculateSymbolStopLossPrice function with multiple symbols - should return list prices', async function () {
        const results = await tradeHelper.calculateSymbolStopLossPrice(['BTCUSDT', 'BNBUSDT']);
        results.should.be.an('array');
        results[0].should.include.keys('symbol', 'stopLossPrice');
    });

});
