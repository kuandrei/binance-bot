const debug = require('debug')('bnb:helpers:state');
const binanceHelpers = require('./../helpers/binance');
const dbHelpers = require('./../helpers/db');
const R = require('ramda');
const candlePatterns = require('./technical-indicators/candle-patterns');
const indicators = require('./technical-indicators/indicators');

const {
    Sequelize,
    Deal,
    Client,
    CurrencyPair,
} = require('./../models');

/**
 *
 * @param tradePair
 * @return {Promise.<void>}
 */
async function tradePairState(tradePair) {

    try {

        // get global market state for given currency pair
        const marketCurrencyPairState = await getCurrencyPairState(tradePair.symbol);

        // calculate specific client state for given currency pair
        const ctx = {
            date: new Date(),
            clientId: tradePair.clientId,
            symbol: tradePair.symbol,
            client: (await Client.findByPk(tradePair.clientId)).toJSON(),
            marketPrice: marketCurrencyPairState.marketPrice,
            minProfitPrice: await dbHelpers.getMinProfitPrice(tradePair.clientId, tradePair.symbol),
            tradePair: R.pick([
                'id',
                'clientId',
                'symbol',
                'status',
                'dealQty',
                'minProfitRate'
            ], tradePair),
            currencyPair: (await CurrencyPair.findOne({
                where: {symbol: tradePair.symbol},
                attributes: [
                    'symbol',
                    'firstCurrency',
                    'firstCurrencyPrecision',
                    'secondCurrency',
                    'secondCurrencyPrecision'
                ]
            })).toJSON()
        };
        const state = R.merge(
            R.merge(ctx, marketCurrencyPairState),
            {
                balances: await getBalances(ctx),
                newDeals: await countDeals('New')(ctx),
                openDeals: await countDeals('Open')(ctx),
                openDealsBelowMarketPrice: await countDeals('BelowMarketPrice')(ctx),
                openDealsAboveMarketPrice: await countDeals('AboveMarketPrice')(ctx),
                openDealsInRange: {
                    '0.1%': await countDeals('InRange', 0.1)(ctx),
                    '0.2%': await countDeals('InRange', 0.2)(ctx),
                    '0.3%': await countDeals('InRange', 0.3)(ctx),
                    '0.4%': await countDeals('InRange', 0.4)(ctx),
                    '0.5%': await countDeals('InRange', 0.5)(ctx),
                    '0.6%': await countDeals('InRange', 0.6)(ctx),
                    '0.7%': await countDeals('InRange', 0.7)(ctx),
                    '0.8%': await countDeals('InRange', 0.8)(ctx),
                    '0.9%': await countDeals('InRange', 0.9)(ctx),
                    '1.0%': await countDeals('InRange', 1.0)(ctx)
                },
                openDealsInProfit: await countDeals('InProfit')(ctx)
            }
        );
        // castings
        state.client.commission = parseFloat(state.client.commission);
        state.tradePair.dealQty = parseFloat(state.tradePair.dealQty);
        state.tradePair.minProfitRate = parseFloat(state.tradePair.minProfitRate);

        return state;

    } catch (err) {
        // @todo log error
        console.log('-----------------------------');
        console.dir(err, {colors: true, depth: 5});
        console.log('-----------------------------');
        debug(err.message);
    }
}

async function getCurrencyPairState(symbol) {
    const results = await Promise.all([
        binanceHelpers.getCandles({symbol, interval: '1m', limit: 30}),
        binanceHelpers.getCandles({symbol, interval: '3m', limit: 30}),
        binanceHelpers.getCandles({symbol, interval: '5m', limit: 30})
    ]);
    const candles1m = results[0];
    const candles3m = results[1];
    const candles5m = results[2];

    return {
        symbol: symbol,
        marketPrice: await binanceHelpers.symbolMarketPrice(symbol),
        candlePatterns: {
            '1m': candlePatterns(candles1m),
            '3m': candlePatterns(candles3m),
            '5m': candlePatterns(candles5m)
        },
        indicators: {
            '1m': indicators(candles1m),
            '3m': indicators(candles3m),
            '5m': indicators(candles5m)
        }
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
                where.minProfitPrice = {
                    [Sequelize.Op.lt]: marketPrice
                };
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

/**
 * If current trend is upward (check last 3m MACD) - then stop loss price is 0.05% less than last SMA 1m indicator
 * Else find the last support value (lowest SMA value)
 * @param symbol
 * @return {Promise.<*>}
 */
async function calculateStopLossPrice(symbol) {
    let stopLossPrice;

    const currencyPair = (await CurrencyPair.findOne({
        where: {symbol},
        attributes: ['secondCurrencyPrecision']
    })).toJSON();
    const precision = Math.pow(10, currencyPair.secondCurrencyPrecision);
    // get current state
    const state = await getCurrencyPairState(symbol);

    const lastMacd3m = state.indicators['1m'].MACD[state.indicators['1m'].MACD.length - 1];
    const lastSmaValue3m = state.indicators['3m'].SMA[state.indicators['3m'].SMA.length - 1];
    const lowestSmaValue = R.min(
        R.reduce(R.min, Infinity, state.indicators['1m'].SMA),
        R.reduce(R.min, Infinity, state.indicators['3m'].SMA),
        R.reduce(R.min, Infinity, state.indicators['5m'].SMA)
    );

    if (lastMacd3m.MACD > 0) {
        stopLossPrice = parseFloat(lastSmaValue3m - lastSmaValue3m * 0.01 / 100);
    } else {
        stopLossPrice = parseFloat(lowestSmaValue - lowestSmaValue * 0.01 / 100);
    }

    return Math.round(stopLossPrice * precision) / precision;
}

async function getBalances({currencyPair, clientId}) {
    const balances = (await binanceHelpers.getClientBalances(clientId)).filter(item => {
        return item.asset === currencyPair.firstCurrency || item.asset === currencyPair.secondCurrency;
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
    tradePairState,
    performanceStats,
    calculateStopLossPrice
};