const debug = require('debug')('bnb:workers:analyze-trade-pair');
const stateHelpers = require('./../helpers/state');
const Queue = require('bull');
const openDealQueue = new Queue('open-deal', 'redis://redis:6379');
const errorHandler = require('../helpers/error-handler');

/**
 *
 * @param task
 */
async function main(task) {

    try {
        const state = await stateHelpers.tradePairState(task.data);

        const passed = checkRestrictions(state);
        if (!passed)
            return;

        const result = shouldOpenDeal(state);

        if (result.openDeal === true) {
            state.algorithm = result.algorithm;
            openDealQueue.add(state);
        }

    } catch (err) {
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
    }

}

/**
 * Returns true if no restriction found
 *
 * @param state
 * @return {boolean}
 */
function checkRestrictions(state) {
    // restrictions:
    // 1. maximum 10 loss orders (below market price - deals in profit)
    const lossOrders = state.openDealsBelowMarketPrice - state.openDealsInProfit;
    if (lossOrders >= 5)
        return false;

    const rangeRestrictions = [
        {range: '0.1%', maxDealsInRange: 3},
        {range: '0.2%', maxDealsInRange: 5},
        {range: '0.3%', maxDealsInRange: 7},
        {range: '0.4%', maxDealsInRange: 9},
        {range: '0.5%', maxDealsInRange: 10},
        // {range: '0.6%', maxDealsInRange: 10},
        // {range: '0.7%', maxDealsInRange: 10},
        // {range: '0.8%', maxDealsInRange: 10},
        // {range: '0.9%', maxDealsInRange: 10},
        // {range: '1.0%', maxDealsInRange: 10},
    ];

    if (rangeRestrictions.find(restriction => {
        return state.openDealsInRange[restriction.range] >= restriction.maxDealsInRange;
    })) {
        return false;
    }

    // more restrictions here

    return true;
}

/**
 * @todo implement
 * Algorithm 1
 * Start trade if prev MACD indicator negative and the new one is positive
 */
function shouldOpenDeal(state) {

    // algorithms

    // MACD signal line crossover
    // -------------------------------------------------
    // patterns: (N - negative, P - positive, * - any)
    // 1m (*,*,*,*,P), 3m (N,N,N,N,P), 5m (N,N,N,N,N)
    // 1m (*,*,*,*,P), 3m (N,N,N,P,P), 5m (N,N,N,N,N)
    // 1m (*,*,*,*,P), 3m (N,N,N,P,P), 5m (N,N,N,N,P)
    // 1m (*,*,*,*,P), 3m (N,N,P,P,P), 5m (N,N,N,N,P)
    // 1m (*,*,*,*,P), 3m (N,N,P,P,P), 5m (N,N,N,P,P)
    // 1m (*,*,*,*,P), 3m (N,P,P,P,P), 5m (N,N,N,P,P)
    // 1m (*,*,*,*,P), 3m (N,P,P,P,P), 5m (N,N,P,P,P)

    const patterns = [
        {'3m': 'N,N,N,N,P', '5m': 'N,N,N,N,N', label: '1m (*,*,*,*,P), 3m (N,N,N,N,P), 5m (N,N,N,N,N)'},
        {'3m': 'N,N,N,P,P', '5m': 'N,N,N,N,N', label: '1m (*,*,*,*,P), 3m (N,N,N,P,P), 5m (N,N,N,N,N)'},
        {'3m': 'N,N,N,P,P', '5m': 'N,N,N,N,P', label: '1m (*,*,*,*,P), 3m (N,N,N,P,P), 5m (N,N,N,N,P)'},
        {'3m': 'N,N,P,P,P', '5m': 'N,N,N,N,P', label: '1m (*,*,*,*,P), 3m (N,N,P,P,P), 5m (N,N,N,N,P)'},
        {'3m': 'N,N,P,P,P', '5m': 'N,N,N,P,P', label: '1m (*,*,*,*,P), 3m (N,N,P,P,P), 5m (N,N,N,P,P)'},
        {'3m': 'N,P,P,P,P', '5m': 'N,N,N,P,P', label: '1m (*,*,*,*,P), 3m (N,P,P,P,P), 5m (N,N,N,P,P)'},
        {'3m': 'N,P,P,P,P', '5m': 'N,N,P,P,P', label: '1m (*,*,*,*,P), 3m (N,P,P,P,P), 5m (N,N,P,P,P)'}
    ];

    const lastMACD_1m = state.indicators['1m'].MACD.pop().MACD;
    if (lastMACD_1m > 0) {
        const last5MACD_3m_pattern = state.indicators['3m'].MACD.slice(-5).map(item => item.MACD > 0 ? 'P' : 'N').join(',');
        const last5MACD_5m_pattern = state.indicators['5m'].MACD.slice(-5).map(item => item.MACD > 0 ? 'P' : 'N').join(',');
        const pattern = patterns.find(p => p['3m'] === last5MACD_3m_pattern && p['5m'] === last5MACD_5m_pattern);

        if (pattern) {
            return {
                openDeal: true,
                algorithm: `MACD-SLC/PATTERN:${pattern.label}`
            };
        }
    }

    return {openDeal: false};
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = main;
} else {
    module.exports = {
        main,
        checkRestrictions,
        shouldOpenDeal
    }
}