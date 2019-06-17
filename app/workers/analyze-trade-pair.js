const debug = require('debug')('bnb:workers:analyze-trade-pair');
const stateHelpers = require('./../helpers/state');
const Queue = require('bull');
const openDealQueue = new Queue('open-deal', 'redis://redis:6379');
const errorHandler = require('../helpers/error-handler');

/**
 * Prepares TradePairState with list of KPIs
 * @param task
 * @return {Promise.<void>}
 */
module.exports = async (task) => {

    try {
        const state = await stateHelpers.tradePairState(task.data);

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

            // @todo implement

        const openDeal = false && state.newDeals <= 1 && state.openDeals <= 1;

        if (openDeal) {
            debug(`ADD open-deal task for tradePair#${task.data.id}`);
            openDealQueue.add(state);
        }

    } catch (err) {
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
    }

};
