const binanceHelpers = require('./../helpers/binance');
const R = require('ramda');

const {
    Sequelize,
    Deal,
    ExchangeInfo
} = require('./../models');

/**
 *
 * @param tradePair
 * @param symbolInfo
 * @return {Promise.<void>}
 */
async function tradePairInfo(tradePair, symbolInfo) {

    const ctx = {
        clientId: tradePair.clientId,
        symbol: tradePair.symbol,
        marketPrice: symbolInfo.marketPrice
    };
    return {
        balances: await getBalances(ctx),
        newDeals: await countDeals('New')(ctx),
        openDeals: await countDeals('Open')(ctx),
        openDealsBelowMarketPrice: await countDeals('BelowMarketPrice')(ctx),
        openDealsAboveMarketPrice: await countDeals('AboveMarketPrice')(ctx),
        openDealsInProfit: await countDeals('InProfit')(ctx),
        // @todo ranges should be defined by client
        openDealsInRange_1: await countDeals('InRange', 0.1)(ctx),
        openDealsInRange_2: await countDeals('InRange', 0.2)(ctx),
        openDealsInRange_3: await countDeals('InRange', 0.3)(ctx),
        openDealsInRange_4: await countDeals('InRange', 0.4)(ctx),
        openDealsInRange_5: await countDeals('InRange', 0.5)(ctx)
    };
}

async function performanceStats(clientId) {
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

    return performanceStats;
}

function countDeals(type, range) {
    return async ({clientId, symbol, marketPrice}) => {
        const where = {
            clientId: clientId,
            symbol: symbol,
            status: 'OPEN'
        };
        switch (type) {
            case 'BelowMarketPrice':
                where.openPrice = {
                    [Sequelize.Op.gte]: marketPrice
                };
                break;
            case 'AboveMarketPrice':
                where.openPrice = {
                    [Sequelize.Op.lt]: marketPrice
                };
                break;
            case 'InProfit':
                where[Sequelize.Op.or] = [
                    {
                        [Sequelize.Op.and]: {
                            type: 'UPTREND',
                            minProfitPrice: {
                                [Sequelize.Op.lt]: marketPrice
                            }
                        }
                    },
                    {
                        [Sequelize.Op.and]: {
                            type: 'DOWNTREND',
                            minProfitPrice: {
                                [Sequelize.Op.gt]: marketPrice
                            }
                        }
                    }
                ];
                break;
            case 'New':
                where.status = 'NEW';
                break;
            case 'InRange':
                where.openPrice = {
                    [Sequelize.Op.between]: [
                        marketPrice - marketPrice * (range / 100),
                        marketPrice + marketPrice * (range / 100)
                    ]
                };
                break;
        }
        return await Deal.count({where});
    };
}


async function getBalances({clientId, symbol}) {
    const exchangeInfo = await ExchangeInfo.findOne({
        where: {symbol}
    });
    const balances = (await binanceHelpers.getClientBalances(clientId)).filter(item => {
        return item.asset === exchangeInfo.baseAsset || item.asset === exchangeInfo.quoteAsset;
    });
    const result = {};
    balances.forEach(item => {
        result[item.asset] = {
            free: item.free,
            locked: item.locked
        };
    });
    return result;
}

module.exports = {
    tradePairInfo,
    performanceStats
};