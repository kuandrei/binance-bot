/**
 * Adds analyze-trade-pair task for each active/trading trade pair
 */
const Queue = require('bull');
const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
const debug = require('debug')('bnb:workers:add-trade-pairs-for-analysis');
const {TradePair} = require('./../models');
const errorHandler = require('../helpers/error-handler');

module.exports = async () => {

    try {
        const tradePairs = await TradePair.findAll({
            where: {
                status: 'ACTIVE'
            }
        });

        return await Promise.all(tradePairs.map(tradePair => analyzeTradePairQueue.add(tradePair.toJSON(), {
            removeOnComplete: true
        })));

    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }

};
