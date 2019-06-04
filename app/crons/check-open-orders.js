const async = require('async');
const {CronJob} = require('cron');
const debug = require('debug')('bnb:crons:check-open-orders');
const binanceHelper = require('./../helpers/binance');
const {Order} = require('./../models');

/**
 * Checks open order statuses and updates their status
 */
module.exports = new CronJob({
    cronTime: '* * * * *',
    async onTick() {

        debug('check open orders cron started');

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

    },
    // don't start the job immediately
    start: true,
    // run according to GMT+0
    timeZone: 'Europe/London'
});

async function checkOrder(order) {

    debug(`checks order# ${order.id}`);

    const binanceApiClient = await binanceHelper.initApiClient(order.clientId);
    const binanceOrder = await binanceApiClient.getOrder({
        symbol: order.symbol,
        orderId: order.binanceOrderId
    });

    let status;
    switch (binanceOrder.status) {
        case 'NEW':
            status = 'ACTIVE';
            break;
        case 'FILLED':
            status = 'FILLED';
            break;
        case 'PARTIALLY_FILLED':
            status = 'ACTIVE';
            break;
        case 'CANCELED':
        case 'REJECTED':
        case 'EXPIRED':
            status = 'CANCELED';
            break;
        default:
            debug('UNRECOGNIZED STATUS');
            debug(`binance order`, binanceOrder);
            return;
    }

    if (status !== order.status) {
        debug(`CHANGE ORDER #${order.id} STATUS FROM '${order.status}' TO '${status}'`);
        order.status = status;
        order.closedAt = new Date();
        order.save();
    }
}
