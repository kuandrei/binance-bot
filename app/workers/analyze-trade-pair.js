const debug = require('debug')('bnb:workers:analyze-trade-pair');
const stateHelper = require('./../helpers/state');
const Queue = require('bull');
const openDealQueue = new Queue('open-deal', 'redis://redis:6379');

/**
 * Prepares TradePairState with list of KPIs
 * @param task
 * @return {Promise.<void>}
 */
module.exports = async (task) => {

    try {
        debug('analyze trade pair worker');

        const state = await stateHelper(task.data);

        /**
         * Algorithm 1
         * Start trade if prev MACD indicator negative and the new one is positive
         */
        // const macdIndicators1m = state.indicators['1m'].MACD;
        // const macdIndicators3m = state.indicators['3m'].MACD;
        // const macdIndicators5m = state.indicators['5m'].MACD;
        // if (state.indicators['1m'].MACD.length)

        // console.log('-----------------------------');
        // console.dir({
        //     state
        // }, {colors: true, depth: 2});
        // console.log('-----------------------------');

        const openDeal = state.newDeals === 0 && state.openDeals === 0;

        if (openDeal) {
            debug(`add open-deal task for tradePair#${task.data.id}`);
            openDealQueue.add(state);
        }

    } catch (err) {
        debug(err.message);
    }

};
