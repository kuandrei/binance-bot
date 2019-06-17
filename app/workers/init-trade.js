const Queue = require('bull');
const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
const async = require('async');
const debug = require('debug')('bnb:workers:init-trade');
const {TradePair} = require('./../models');
const errorHandler = require('../helpers/error-handler');

/**
 * Load all active trade pairs and add them to analyze trade-pair-queue
 *
 * @return {Promise.<void>}
 */
module.exports = async () => {

    let filter = {
        where: {
            status: 'ACTIVE'
        }
    };
    try {
        const tradePairs = await TradePair.findAll(filter);

        if (tradePairs.length > 0)
            async.each(tradePairs, addToQueue);

    } catch (err) {
        errorHandler(err, {
            filter
        });
        debug(`ERROR: ${err.message}`);
    }

};

async function addToQueue(tradePair) {
    analyzeTradePairQueue.add(tradePair, {
        removeOnComplete: true
    });
}
