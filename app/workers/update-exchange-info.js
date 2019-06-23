const request = require('request-promise-native');
const debug = require('debug')('bnb:update-exchange-info');
const {ExchangeInfo} = require('./../models');
const errorHandler = require('../helpers/error-handler');

const numericKeys = [
    'maxPrice',
    'minPrice',
    'tickSize',
    'multiplierUp',
    'multiplierDown',
    'minQty',
    'maxQty',
    'stepSize',
    'minNotional'
];

/**
 * Updates data in ExchangeInfo table with data loaded from https://www.binance.com/api/v1/exchangeInfo
 *
 * @return {Promise.<void>}
 */
async function main() {
    debug('UPDATE EXCHANGE INFO CRON STARTED');
    try {
        const info = JSON.parse(await request.get('https://www.binance.com/api/v1/exchangeInfo'));
        await ExchangeInfo.destroy({truncate: true});
        const symbols = info.symbols.map(symbolData => {
            symbolData.filters.map(filter => {
                numericKeys.forEach(key => {
                    if (filter[key])
                        filter[key] = parseFloat(filter[key]);
                });
            });
            return symbolData;
        });
        await ExchangeInfo.bulkCreate(symbols);
    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }
}

module.exports = main;

