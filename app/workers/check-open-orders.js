const debug = require('debug')('bnb:workers:check-open-orders');
const tradeHelper = require('./../helpers/trade');
const binanceHelper = require('./../helpers/binance');
const dbHelper = require('./../helpers/db');
const {Sequelize, Deal, Order} = require('./../models');
const errorHandler = require('../helpers/error-handler');

const Queue = require('bull');
const replaceStopLossOrderQueue = new Queue('replace-stop-loss-order', 'redis://redis:6379');

/**
 * Checks open order statuses and updates their status
 */
module.exports = async () => {

    let orders, symbols, symbolsStopLossPrice;
    try {

        // 1 Check status of all open orders
        const filter = {
            where: {
                status: {
                    [Sequelize.Op.in]: ['NEW', 'ACTIVE', 'PARTIALLY_FILLED']
                }
            }
        };
        // added for testing, fake orders added in tests being automatically tested and got error from binance
        // this statement skips them
        if (process.env.NODE_ENV === 'test')
            filter.where.createdAt = {
                [Sequelize.Op.lt]: new Date(new Date().getTime() - (5 * 1000))
            };
        orders = await Order.findAll(filter);
        await Promise.all(orders.map(checkOrderIsFilled));

        // 2 Check status of open UPTREND STOP LOSS orders
        symbols = await dbHelper.getTradingSymbols();
        symbolsStopLossPrice = await tradeHelper.calculateSymbolStopLossPrice('UPTREND', symbols);
        await Promise.all(
            symbolsStopLossPrice.map(async ({symbol, stopLossPrice}) => {
                orders = await dbHelper.findOpenStopLossOrder('UPTREND', symbol, stopLossPrice);
                await Promise.all(
                    orders.map(async order => {
                        await replaceStopLossOrderQueue.add({
                            stopLossPrice,
                            order: order.toJSON()
                        });
                    })
                );
            })
        );

        // 3 Check status of open DOWNTREND STOP LOSS orders
        symbols = await dbHelper.getTradingSymbols();
        symbolsStopLossPrice = await tradeHelper.calculateSymbolStopLossPrice('DOWNTREND', symbols);
        await Promise.all(
            symbolsStopLossPrice.map(async ({symbol, stopLossPrice}) => {
                orders = await dbHelper.findOpenStopLossOrder('DOWNTREND', symbol, stopLossPrice);
                await Promise.all(
                    orders.map(async order => {
                        await replaceStopLossOrderQueue.add({
                            stopLossPrice,
                            order: order.toJSON()
                        });
                    })
                );
            })
        );

    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }

};

async function checkOrderIsFilled(order) {
    const deal = await Deal.findByPk(order.dealId);
    try {
        const binanceApiClient = await binanceHelper.initApiClient(order.clientId);
        const binanceOrder = await binanceApiClient.getOrder({
            symbol: order.symbol,
            orderId: order.binanceOrderId
        });

        if (binanceOrder.status !== order.status) {
            debug(`CHANGE ORDER#${order.id} STATUS FROM '${order.status}' TO '${binanceOrder.status} (DEAL#${order.dealId}/${order.symbol})'`);
            order.status = binanceOrder.status;
            order.closedAt = new Date();
            
            if (order.status === 'FILLED') {
                // change deal from NEW to OPEN
                if (deal.status === 'NEW') {
                    deal.status = 'OPEN';
                    await deal.save();
                } else if (deal.status === 'OPEN' && order.side === 'SELL') {
                    deal.status = 'CLOSED';
                    deal.closePrice = order.price;
                    await deal.save();
                    debug(`CHANGE DEAL #${deal.id} STATUS FROM 'OPEN' TO 'CLOSED' (${deal.symbol})'`);
                }
            }

            await order.save();
        }
    } catch (err) {
        errorHandler(err, {
            order: order.toJSON(),
            deal: deal.toJSON()
        });

        if (err.code && err.code === -1021)
            return;

        deal.status = 'ERROR';
        deal.save();

        order.status = 'ERROR';
        order.error = err;
        await order.save();
    }
}
