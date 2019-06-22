const R = require('ramda');
const stateHelpers = require('./../helpers/state');
const {TradePair, Deal} = require('./../models');

module.exports = {

    index: async (req, res, next) => {
        try {
            const clientId = parseInt(req.query.clientId) || 1; // take from request
            const closedDeals = await Deal.findAll({
                where: {
                    status: 'CLOSED',
                    clientId
                },
                include: 'orders'
            });
            const performanceStats = {
                tradePairs: {},
                totals: {}
            };

            closedDeals.forEach(deal => {
                if (!performanceStats.tradePairs[deal.symbol]) {
                    performanceStats.tradePairs[deal.symbol] = {};
                    performanceStats.tradePairs[deal.symbol][deal.orders[0].creditCurrency] = 0;
                    performanceStats.tradePairs[deal.symbol][deal.orders[0].debitCurrency] = 0;
                    if (!performanceStats.totals[deal.orders[0].creditCurrency])
                        performanceStats.totals[deal.orders[0].creditCurrency] = 0;
                    if (!performanceStats.totals[deal.orders[0].debitCurrency])
                        performanceStats.totals[deal.orders[0].debitCurrency] = 0;
                }
                const filledOrders = deal.orders.filter(o => o.status === 'FILLED');
                filledOrders.forEach(order => {
                    performanceStats.tradePairs[deal.symbol][order.creditCurrency] += order.credit;
                    performanceStats.tradePairs[deal.symbol][order.debitCurrency] -= order.debit;
                    performanceStats.totals[order.creditCurrency] += order.credit;
                    performanceStats.totals[order.debitCurrency] -= order.debit;
                });
            });
            // round
            const precision = Math.pow(10, 8);
            R.keys(performanceStats.totals).forEach(currency => {
                performanceStats.totals[currency] = Math.round(performanceStats.totals[currency] * precision) / precision;
            });
            R.keys(performanceStats.tradePairs).forEach(symbol => {
                R.keys(performanceStats.tradePairs[symbol]).forEach(currency => {
                    performanceStats.tradePairs[symbol][currency] = Math.round(performanceStats.tradePairs[symbol][currency] * precision) / precision;
                });
            });


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
    }
};
