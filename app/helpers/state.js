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
module.exports = async (tradePair) => {

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
            tradePair: R.pick(['id', 'symbol', 'status', 'dealQty', 'additionPercentage'], tradePair),
            currencyPair: (await CurrencyPair.findOne({
                where: {symbol: tradePair.symbol},
                attributes: [
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
                openDealsInProfit: await countDeals('InProfit')(ctx)
            }
        );
        // castings
        state.client.commission = parseFloat(state.client.commission);
        state.tradePair.dealQty = parseFloat(state.tradePair.dealQty);
        state.tradePair.additionPercentage = parseFloat(state.tradePair.additionPercentage);
        state.currencyPair.commission = parseFloat(state.currencyPair.commission);

        return state;

    } catch (err) {
        console.log('-----------------------------');
        console.dir(err.message, {colors: true, depth: 5});
        console.log('-----------------------------');
        debug(err.message);
    }
};

const getCurrencyPairState = async (symbol) => {
    // @todo - send requests in parallel
    const candles1m = await binanceHelper.getCandles({symbol, interval: '1m', limit: 30});
    const candles3m = await binanceHelper.getCandles({symbol, interval: '3m', limit: 30});
    const candles5m = await binanceHelper.getCandles({symbol, interval: '5m', limit: 30});

    return {
        symbol: symbol,
        marketPrice: await binanceHelper.symbolMarketPrice(symbol),
        candlePatterns: {
            '1m': candlePatterns(candles1m),
            '3m': candlePatterns(candles3m),
            '5m': candlePatterns(candles5m)
            // trend: 'uptrend' // 'uptrend-peak', 'downtrend', 'downtrend-curve', 'sideways'
        },
        indicators: {
            '1m': indicators(candles1m),
            '3m': indicators(candles3m),
            '5m': indicators(candles5m)
        }
    };
};

const countDeals = (type) => async ({clientId, symbol, marketPrice}) => {
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
    }
    return Deal.count({where});
};


const getBalances = async ({currencyPair, clientId}) => {
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
};