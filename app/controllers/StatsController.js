const R = require('ramda');
const stateHelpers = require('./../helpers/state');
const {TradePair} = require('./../models');

module.exports = {

    index: async (req, res, next) => {
        try {
            const clientId = parseInt(req.query.clientId) || 1; // take from request
            const performanceStats = await stateHelpers.performanceStats(clientId);
            const tradePairs = await TradePair.findAll({
                where: {
                    status: 'ACTIVE',
                    clientId
                }
            });
            const info = await Promise.all(
                tradePairs.map(async tradePair => {
                    return R.pick([
                        'clientId',
                        'symbol',
                        'marketPrice',
                        'minProfitPrice',
                        'newDeals',
                        'openDeals',
                        'openDealsBelowMarketPrice',
                        'openDealsAboveMarketPrice',
                        'openDealsInRange',
                        'openDealsInProfit'
                    ], await stateHelpers.tradePairState(tradePair));
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
            res.json(await stateHelpers.performanceStats(clientId));
        } catch (err) {
            next(err);
        }
    }
};
