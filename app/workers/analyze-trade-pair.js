const debug = require('debug')('bnb:workers:analyze-trade-pair');
const binanceHelper = require('./../helpers/binance');

/**
 * Prepares TradePairState with list of KPIs
 * @param job
 * @return {Promise.<void>}
 */
module.exports = async (job) => {

    debug('analyze trade pair worker');

    const tradePair = job.data;
    const state = {
        tradePairId: tradePair.id,
        symbol: tradePair.symbol,
        marketPrice: await binanceHelper.symbolMarketPrice(tradePair.symbol),
        balance: await binanceHelper.symbolMarketPrice(tradePair.symbol),
        openOrders: 3,
        openOrdersBelowMarketPrice: 1,
        openOrdersAboveMarketPrice: 2,
    };

    console.log('-----------------------------');
    console.dir({
        tradePair,
        state
    }, {colors: true, depth: 5});
    console.log('-----------------------------');


};
