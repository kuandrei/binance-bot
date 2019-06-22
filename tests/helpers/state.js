require('chai').should();

const stateHelpers = require('../../app/helpers/state');
const tradePairId = 3;
const {TradePair} = require('../../app/models');

describe('State helpers', function () {

    it('Generate state for BTCUSDT', async function () {

        const tradePair = await TradePair.findByPk(tradePairId);
        const result = await stateHelpers.tradePairState(tradePair);

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
            'openDealsInRange',
            'candlePatterns',
            'indicators'
        ]);
        result.openDealsInRange.should.include.keys([
            '0.1%',
            '0.2%',
            '0.3%',
            '0.4%',
            '0.5%',
            '0.6%',
            '0.7%',
            '0.8%',
            '0.9%',
            '1.0%',
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

    it('performanceStats', async function () {
        const stats = await stateHelpers.performanceStats(1);
        stats.should.be.an('object');
        stats.should.contain.keys('tradePairs', 'totals');
    });

});
