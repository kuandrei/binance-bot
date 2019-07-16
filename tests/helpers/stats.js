require('chai').should();
const moment = require('moment');

const statsHelper = require('../../app/helpers/stats');
const {TradePair, SymbolInfo} = require('./../../app/models');

describe('test stats helper', function () {

    it('test tradePairInfo function - should return stats details', async function () {
        const tradePair = await TradePair.findOne({where: {symbol: 'BTCUSDT'}});
        const symbolInfo = await SymbolInfo.findOne({
            where: {
                symbol: 'BTCUSDT'
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        const result = await statsHelper.tradePairInfo(tradePair, symbolInfo);
        result.should.be.an('object');
        result.should.contain.keys([
            'symbol',
            'marketPrice',
            'balances',
            'newDeals',
            'openDeals',
            'openDealsBelowMarketPrice',
            'openDealsAboveMarketPrice',
            'openDealsInProfit',
            'openDealsInRange_1',
            'openDealsInRange_2',
            'openDealsInRange_3',
            'openDealsInRange_4',
            'openDealsInRange_5'
        ]);
    });

    it('test performanceStats function (all time) - should return stats details', async function () {
        const result = await statsHelper.performanceStats(1);
        result.should.be.an('object');
        result.should.contain.keys([
            'tradePairs',
            'totals'
        ]);
    });

    it('test performanceStats function (last 24 hours)  - should return stats details', async function () {

        const dateTo = new Date(moment().subtract(0, 'days').format('YYYY-MM-DD'));
        const dateFrom = new Date(moment().subtract(1, 'days').format('YYYY-MM-DD'));
        const result = await statsHelper.performanceStats(1, dateFrom, dateTo);
        result.should.be.an('object');
        result.should.contain.keys([
            'tradePairs',
            'totals'
        ]);
    });

});
