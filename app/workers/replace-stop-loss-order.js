const debug = require('debug')('bnb:workers:replace-stop-loss-order');
const binanceHelpers = require('./../helpers/binance');
const {Deal} = require('./../models');
const errorHandler = require('../helpers/error-handler');

const Queue = require('bull');
const addStopLossOrderQueue = new Queue('add-stop-loss-order', 'redis://redis:6379');
/**
 * 1. cancel existing order
 * 2. place new one by adding add-stop-loss-order task
 */
async function replaceStopLossOrder({order, stopLossPrice}) {

    try {

        await binanceHelpers.cancelOrder(order.clientId, order.symbol, order.binanceOrderId);
        order.status = 'CANCELED';
        await order.save();
        debug(`REPLACE STOP_LOSS_LIMIT (DEAL#${order.dealId}/ORDER#${order.id}/${order.symbol}/PREV-PRICE:${order.price}/NEW-PRICE:${stopLossPrice})`);

        const deal = await Deal.findByPk(order.dealId);
        await addStopLossOrderQueue.add({
            stopLossPrice,
            deal: deal.toJSON()
        });


    } catch (err) {
        errorHandler(err, {
            order: order.toJSON(),
            stopLossPrice
        });
        debug(`ERROR: ${err.message}`);
    }

}

module.exports = replaceStopLossOrder;
