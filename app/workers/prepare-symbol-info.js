const debug = require('debug')('bnb:workers:prepare-symbol-info');
const technicalIndicatorsHelpers = require('./../helpers/technical-indicators');
const errorHandler = require('./../helpers/error-handler');
const {SymbolInfo} = require('./../models');
/**
 *
 * @param task
 */
module.exports = async task => {

    try {
        const symbol = task.data.symbol;

        const data = await technicalIndicatorsHelpers.calculateSymbolTechIndicators(symbol);
        return await SymbolInfo.create(data);

    } catch (err) {
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
    }

};