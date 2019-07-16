const binanceHelper = require('./../helpers/binance');
const tradeHelper = require('./../helpers/trade');
const R = require('ramda');

const {
    Sequelize,
    Deal,
    Order,
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
        symbol: tradePair.symbol,
        marketPrice: symbolInfo.marketPrice,
        stopLossPrice: await tradeHelper.calculateSymbolStopLossPrice(tradePair.tradeOn, tradePair.symbol),
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

async function performanceStats(clientId, fromDate = null, toDate = null) {
    const filter = {
        where: {
            status: 'FILLED',
            clientId
        }
    };

    if (fromDate) {
        filter.where.createdAt = {
            [Sequelize.Op.between]: [fromDate, toDate || new Date()]
        };
    }

    const filledOrders = await Order.findAll(filter);
    const performanceStats = {
        tradePairs: {},
        totals: {}
    };

    filledOrders.forEach(order => {
        if (!performanceStats.tradePairs[order.symbol]) {
            performanceStats.tradePairs[order.symbol] = {};
            performanceStats.tradePairs[order.symbol][order.creditCurrency] = 0;
            performanceStats.tradePairs[order.symbol][order.debitCurrency] = 0;
            if (!performanceStats.totals[order.creditCurrency])
                performanceStats.totals[order.creditCurrency] = 0;
            if (!performanceStats.totals[order.debitCurrency])
                performanceStats.totals[order.debitCurrency] = 0;
        }

        performanceStats.tradePairs[order.symbol][order.creditCurrency] += order.credit;
        performanceStats.tradePairs[order.symbol][order.debitCurrency] -= order.debit;
        performanceStats.totals[order.creditCurrency] += order.credit;
        performanceStats.totals[order.debitCurrency] -= order.debit;
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
    const balances = (await binanceHelper.getClientBalances(clientId)).filter(item => {
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