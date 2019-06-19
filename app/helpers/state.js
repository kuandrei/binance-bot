const debug = require('debug')('bnb:helpers:state');
const binanceHelper = require('./../helpers/binance');
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
            tradePair: R.pick([
                'id',
                'clientId',
                'symbol',
                'status',
                'dealQty',
                'additionPercentage'
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
                    '0.25%': await countDeals('InRange', 0.25)(ctx),
                    '0.5%': await countDeals('InRange', 0.5)(ctx),
                    '0.75%': await countDeals('InRange', 0.75)(ctx),
                    '1.0%': await countDeals('InRange', 1)(ctx)
                },
                openDealsInProfit: await countDeals('InProfit')(ctx)
            }
        );
        // castings
        state.client.commission = parseFloat(state.client.commission);
        state.tradePair.dealQty = parseFloat(state.tradePair.dealQty);
        state.tradePair.additionPercentage = parseFloat(state.tradePair.additionPercentage);

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
        binanceHelper.getCandles({symbol, interval: '1m', limit: 30}),
        binanceHelper.getCandles({symbol, interval: '3m', limit: 30}),
        binanceHelper.getCandles({symbol, interval: '5m', limit: 30})
    ]);
    const candles1m = results[0];
    const candles3m = results[1];
    const candles5m = results[2];

    return {
        symbol: symbol,
        marketPrice: await binanceHelper.symbolMarketPrice(symbol),
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
    const balances = (await binanceHelper.getClientBalances(clientId)).filter(item => {
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
    calculateStopLossPrice
};