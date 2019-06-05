const Queue = require('bull');
const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
const async = require('async');
const debug = require('debug')('bnb:workers:start-trade');
const {TradePair} = require('./../models');

/**
 * Load all active trade pairs and add them to analyze trade-pair-queue
 *
 * @return {Promise.<void>}
 */
module.exports = async () => {

    debug('start trade worker started');

    let filter = {
        where: {
            status: 'ACTIVE'
        }
    };
    try {
        const tradePairs = await TradePair.findAll(filter);

        if (tradePairs.length === 0)
            debug('no trade pairs found');
        else {
            debug(`found ${tradePairs.length} active trade pairs`);
            async.each(tradePairs, addToQueue);
        }
    } catch (err) {
        debug('Unexpected error', err);
    }

};

async function addToQueue(tradePair) {
    console.log('-----------------------------');
    console.dir({tradePair: tradePair.toJSON()}, {colors: true, depth: 5});
    console.log('-----------------------------');
    debug(`add trade-pair# ${tradePair.id} to analyze-trade-pair queue`);
    analyzeTradePairQueue.add(tradePair, {
        removeOnComplete: true
    });
}
