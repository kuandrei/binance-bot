require('chai').should();

const tradeHelper = require('../../app/helpers/trade');

describe('test trade helpers', function () {

    describe('UPTREND use cases', function () {
        it('test calculateSymbolStopLossPrice function with single symbol - should return symbol market price', async function () {
            const result = await tradeHelper.calculateSymbolStopLossPrice('UPTREND', 'BTCUSDT');
            result.should.be.a('number');
        });

        it('test calculateSymbolStopLossPrice function with multiple symbols - should return list prices', async function () {
            const results = await tradeHelper.calculateSymbolStopLossPrice('UPTREND', ['BTCUSDT', 'BNBUSDT']);
            results.should.be.an('array');
            results[0].should.include.keys('symbol', 'stopLossPrice');
        });
    });

    describe('DOWNTREND use cases', function () {
        it('test calculateSymbolStopLossPrice function with single symbol - should return symbol market price', async function () {
            const result = await tradeHelper.calculateSymbolStopLossPrice('DOWNTREND', 'BTCUSDT');
            result.should.be.a('number');
        });

        it('test calculateSymbolStopLossPrice function with multiple symbols - should return list prices', async function () {
            const results = await tradeHelper.calculateSymbolStopLossPrice('DOWNTREND', ['BTCUSDT', 'BNBUSDT']);
            results.should.be.an('array');
            results[0].should.include.keys('symbol', 'stopLossPrice');
        });
    });
});
