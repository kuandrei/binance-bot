const async = require('async');
const debug = require('debug')('bnb:workers:check-stop-loss-orders');
const binanceHelper = require('./../helpers/binance');
const {Sequelize, Deal, Order} = require('./../models');

/**
 * Checks open order statuses and updates their status
 */
module.exports = async () => {

    debug('check open orders worker started');

    let filter = {
        where: {
            status: {
                [Sequelize.Op.in]: ['NEW', 'ACTIVE']
            }
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
        debug('Unexpected error', err.message);
    }

};

async function checkOrder(order) {

    debug(`checks order# ${order.id}`);

    try {
        const binanceApiClient = await binanceHelper.initApiClient(order.clientId);
        const binanceOrder = await binanceApiClient.getOrder({
            symbol: order.symbol,
            orderId: order.binanceOrderId
        });

        if (binanceOrder.status !== order.status) {
            debug(`CHANGE ORDER #${order.id} STATUS FROM '${order.status}' TO '${binanceOrder.status}'`);
            order.status = binanceOrder.status;
            order.closedAt = new Date();
            await order.save();

            // change deal from NEW to OPEN
            const deal = await Deal.findByPk(order.dealId);
            if (deal.status === 'NEW') {
                deal.status = 'OPEN';
                deal.save();
            }
        }
    } catch (err) {
        order.status = 'ERROR';
        order.error = err;
        await order.save();

        const deal = await Deal.findByPk(order.dealId);
        deal.status = 'ERROR';
        deal.save();
    }
}