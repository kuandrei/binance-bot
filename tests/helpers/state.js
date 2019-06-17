require('chai').should();

const server = require('../../app/server');
const stateHelpers = require('../../app/helpers/state');
const tradePairId = 1;
const {TradePair} = require('../../app/models');

before((done) => {
    if (server.started)
        return done();
    server.once('started', done);
});

describe.only('State helpers', function () {

    it('Generate state for BTCUSDT', async function () {

        const tradePair = await TradePair.findByPk(tradePairId);
        const result = await stateHelpers.tradePairState(tradePair);
        console.log('-----------------------------');
        console.dir(result, {colors: true, depth: 1});
        console.log('-----------------------------');
        result.should.be.an('object');
        result.should.include.keys([
            'date',
            'clientId',
            'symbol',
            'client',
            'marketPrice',
            'tradePair',
            'currencyPair',
            'balances',
            'openDeals',
            'openDealsBelowMarketPrice',
            'openDealsAboveMarketPrice',
            'openDealsInProfit',
            'candlePatterns',
            'indicators'
        ]);
        result.tradePair.should.include.keys([
            'id',
            'clientId',
            'symbol',
            'status',
            'dealQty',
            'additionPercentage'
        ]);
        result.currencyPair.should.include.keys([
            'symbol',
            'firstCurrency',
            'firstCurrencyPrecision',
            'secondCurrency',
            'secondCurrencyPrecision'
        ]);
        result.candlePatterns.should.include.keys(['1m', '3m', '5m']);
        result.indicators.should.include.keys(['1m', '3m', '5m']);
        result.indicators['1m'].should.include.keys(['MACD']);

    });

    it('calculateStopLossPrice', async function () {
        const price = await stateHelpers.calculateStopLossPrice('BTCUSDT');
        price.should.be.a('number');
    });


});
