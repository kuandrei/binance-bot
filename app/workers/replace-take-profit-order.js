const debug = require('debug')('bnb:workers:replace-take-profit-order');
const binanceHelpers = require('./../helpers/binance');
const {Deal} = require('./../models');
const errorHandler = require('../helpers/error-handler');

const Queue = require('bull');
const addTakeProfitOrderQueue = new Queue('add-take-profit-order', 'redis://redis:6379');
/**
 * 1. cancel existing order
 * 2. place new one by adding add-take-profit-order task
 */
async function replaceTakeProfitOrder({order, takeProfitPrice}) {

    try {

        await binanceHelpers.cancelOrder(order.clientId, order.symbol, order.binanceOrderId);
        order.status = 'CANCELED';
        await order.save();
        debug(`REPLACE TAKE_PROFIT_LIMIT (DEAL#${order.dealId}/ORDER#${order.id}/${order.symbol}/PREV-PRICE:${order.price}/NEW-PRICE:${takeProfitPrice})`);

        const deal = await Deal.findByPk(order.dealId);
        await addTakeProfitOrderQueue.add({
            takeProfitPrice,
            deal: deal.toJSON()
        });


    } catch (err) {
        errorHandler(err, {
            order: order.toJSON(),
            takeProfitPrice
        });
        debug(`ERROR: ${err.message}`);
    }

}

module.exports = replaceTakeProfitOrder;
