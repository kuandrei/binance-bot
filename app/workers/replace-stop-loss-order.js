const debug = require('debug')('bnb:workers:replace-stop-loss-order');
const binanceHelpers = require('./../helpers/binance');
const {Order, Deal} = require('./../models');
const errorHandler = require('../helpers/error-handler');

const Queue = require('bull');
const addStopLossOrderQueue = new Queue('add-stop-loss-order', 'redis://redis:6379');
/**
 * 1. cancel existing order
 * 2. place new one by adding add-stop-loss-order task
 */
async function replaceStopLossOrder(task) {

    try {
        const {order, stopLossPrice} = task.data;
        await binanceHelpers.cancelOrder(order.clientId, order.symbol, order.binanceOrderId);
        
        const o = await TradePair.findByPk(order.id);
        o.status = 'CANCELED';
        await o.save();

        debug(`REPLACE STOP_LOSS_LIMIT (DEAL#${order.dealId}/ORDER#${order.id}/${order.symbol}/PREV-PRICE:${order.price}/NEW-PRICE:${stopLossPrice})`);

        const deal = await Deal.findByPk(order.dealId);
        await addStopLossOrderQueue.add({
            stopLossPrice,
            deal: deal.toJSON()
        });


    } catch (err) {
        rrorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
    }

}

module.exports = replaceStopLossOrder;
