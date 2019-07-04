/**
 * dds prepare-symbol-info task for every active/trading symbol
 */
const Queue = require('bull');
const prepareSymbolInfoQueue = new Queue('prepare-symbol-info', 'redis://redis:6379');
const debug = require('debug')('bnb:workers:add-symbols-for-analysis');
const dbHelpers = require('./../helpers/db');
const errorHandler = require('../helpers/error-handler');

module.exports = async () => {

    try {
        const symbols = await dbHelpers.getTradingSymbols();
        return await Promise.all(symbols.map(symbol => prepareSymbolInfoQueue.add({symbol}, {
            removeOnComplete: true
        })));
    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }

};
