const R = require('ramda');
const stateHelpers = require('./../helpers/state');
const {TradePair} = require('./../models');

module.exports = {

    index: async (req, res, next) => {
        try {
            const tradePairs = await TradePair.findAll({where: {status: 'ACTIVE'}});
            const response = await Promise.all(
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
            res.json(response);

        } catch (err) {
            next(err);
        }
    }
};
