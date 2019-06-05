const async = require('async');
const debug = require('debug')('bnb:workers:check-open-orders');
const binanceHelper = require('./../helpers/binance');
const {Order} = require('./../models');

/**
 * Checks open order statuses and updates their status
 */
module.exports = async () => {

    debug('check open orders worker started');

    let filter = {
        where: {
            status: 'ACTIVE'
        },
        limit: 100
    };
    try {
        const orders = await Order.findAll(filter);

        if (orders.length === 0)
            debug('no orders found');
        else {
            debug(`found ${orders.length} open orders`);
            async.each(orders, checkOrder);
        }
    } catch (err) {
        debug('Unexpected error', err);
    }

};

async function checkOrder(order) {

    debug(`checks order# ${order.id}`);

    const binanceApiClient = await binanceHelper.initApiClient(order.clientId);
    const binanceOrder = await binanceApiClient.getOrder({
        symbol: order.symbol,
        orderId: order.binanceOrderId
    });

    if (binanceOrder.status !== order.status) {
        debug(`CHANGE ORDER #${order.id} STATUS FROM '${order.status}' TO '${binanceOrder.status}'`);
        order.status = binanceOrder.status;
        order.closedAt = new Date();
        order.save();
    }
}