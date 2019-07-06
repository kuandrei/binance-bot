const R = require('ramda');
const statsHelpers = require('./../helpers/stats');
const {TradePair, SymbolInfo} = require('./../models');

module.exports = {

    index: async (req, res, next) => {
        try {
            const symbolInfoCache = {};
            const clientId = parseInt(req.query.clientId) || 1; // take from request
            const performanceStats = await statsHelpers.performanceStats(clientId);
            const tradePairs = await TradePair.findAll({
                where: {
                    status: 'ACTIVE',
                    clientId
                }
            });
            const info = await Promise.all(
                tradePairs.map(async tradePair => {
                    const symbolInfo = symbolInfoCache[tradePair.symbol] || await SymbolInfo.findOne({
                        where: {
                            symbol: tradePair.symbol
                        }
                    });
                    symbolInfoCache[tradePair.symbol] = symbolInfo;
                    return R.pick([
                        'symbol',
                        'marketPrice',
                        'stopLossPrice',
                        'takeProfitPrice',
                        'newDeals',
                        'openDeals',
                        'openDealsBelowMarketPrice',
                        'openDealsAboveMarketPrice',
                        'openDealsInProfit',
                        'openDealsInRange_1',
                        'openDealsInRange_2',
                        'openDealsInRange_3',
                        'openDealsInRange_4',
                        'openDealsInRange_5',
                    ], await statsHelpers.tradePairInfo(tradePair, symbolInfo));
                }));
            res.json({
                performance: performanceStats,
                info
            });

        } catch (err) {
            next(err);
        }
    },

    performance: async (req, res, next) => {
        try {
            const clientId = parseInt(req.query.clientId) || 1;
            res.json(await statsHelpers.performanceStats(clientId));
        } catch (err) {
            next(err);
        }
    }
};
