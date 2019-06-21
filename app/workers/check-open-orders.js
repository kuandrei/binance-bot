const async = require('async');
const debug = require('debug')('bnb:workers:check-open-orders');
const binanceHelper = require('./../helpers/binance');
const {Sequelize, Deal, Order} = require('./../models');
const errorHandler = require('../helpers/error-handler');

/**
 * Checks open order statuses and updates their status
 */
module.exports = async () => {

    let filter = {
        where: {
            status: {
                [Sequelize.Op.in]: ['NEW', 'ACTIVE', 'PARTIALLY_FILLED']
            }
        }
    };
    try {
        const orders = await Order.findAll(filter);

        if (orders.length > 0)
            async.each(orders, checkOrder);
    } catch (err) {
        errorHandler(err, {
            filter
        });
        debug(`ERROR: ${err.message}`);
    }

};

async function checkOrder(order) {

    try {
        const binanceApiClient = await binanceHelper.initApiClient(order.clientId);
        const binanceOrder = await binanceApiClient.getOrder({
            symbol: order.symbol,
            orderId: order.binanceOrderId
        });

        if (binanceOrder.status !== order.status) {
            debug(`CHANGE ORDER #${order.id} STATUS FROM '${order.status}' TO '${binanceOrder.status} (DEAL#${order.dealId}/SYMBOL:${order.symbol})'`);
            order.status = binanceOrder.status;
            order.closedAt = new Date();
            await order.save();

            if (order.status === 'FILLED') {
                // change deal from NEW to OPEN
                const deal = await Deal.findByPk(order.dealId);
                if (deal.status === 'NEW') {
                    deal.status = 'OPEN';
                    deal.save();
                } else if (deal.status === 'OPEN' && order.side === 'SELL') {
                    deal.status = 'CLOSED';
                    deal.closePrice = order.price;
                    deal.save();
                    debug(`CHANGE DEAL #${deal.id} STATUS FROM 'OPEN' TO 'CLOSE (SYMBOL:${deal.symbol})'`);
                }
            }
        }
    } catch (err) {
        errorHandler(err, {
            order: order.toJSON(),
            deal: deal.toJSON()
        });

        order.status = 'ERROR';
        order.error = err;
        await order.save();

        const deal = await Deal.findByPk(order.dealId);
        deal.status = 'ERROR';
        deal.save();
    }
}