const async = require('async');
const debug = require('debug')('bnb:workers:check-stop-loss-orders');
const dbHelpers = require('./../helpers/db');
const stateHelpers = require('./../helpers/state');
const binanceHelpers = require('./../helpers/binance');
const {Order, Client, CurrencyPair} = require('./../models');
const errorHandler = require('../helpers/error-handler');

/**
 * 1. find all active symbols
 * 2. get market price for each symbol
 * 3. find all active stop_loss orders above the market price
 * 4. for each order
 *    a. cancel order
 *    b. place new one with higher price
 */
async function main() {

    const symbols = await dbHelpers.getActiveSymbols();

    async.eachSeries(symbols, async symbol => {
        // calculate stop loss price
        const stopLossPrice = await stateHelpers.calculateStopLossPrice(symbol);
        // find all active stop loss orders below new stop loss price
        const orders = await dbHelpers.findOpenStopLossOrder(symbol, stopLossPrice);
        async.eachSeries(orders, async order => {
            // place new stop loss order by canceling old one and placing new one
            await placeNewStopLossOrder({order, stopLossPrice})
        })
    });

}

/**
 * 1. cancel existing order
 * 2. place new one
 */
async function placeNewStopLossOrder({order, stopLossPrice}) {

    try {

        await binanceHelpers.cancelOrder(order.clientId, order.symbol, order.binanceOrderId);
        order.status = 'CANCELED';
        await order.save();

        const {
            binanceOrderData,
            orderData
        } = await prepareData({order, stopLossPrice});

        debug(`REPLACE STOP_LOSS_LIMIT (DEAL#${order.dealId}/ORDER#${order.id}/PREV-PRICE:${order.price}/NEW-PRICE:${stopLossPrice})`);

        const binanceOrder = await binanceHelpers.order(order.clientId, binanceOrderData);

        orderData.binanceOrderId = binanceOrder.orderId;
        const newOrder = await Order.create(orderData);

        return {
            binanceOrder,
            order: newOrder
        };

    } catch (err) {
        errorHandler(err, {
            order: order.toJSON(),
            stopLossPrice
        });
        debug(`ERROR: ${err.message}`);
    }

}

async function prepareData({order, stopLossPrice}) {

    // prepare context
    const client = await Client.findByPk(order.clientId);
    client.commission = parseFloat(client.commission);
    const currencyPair = await CurrencyPair.findOne({
        where: {
            symbol: order.symbol
        }
    });
    const maxPrecision = Math.pow(10, 8);
    const quantity = order.quantity;
    const price = stopLossPrice;

    // place STOP_LOSS_LIMIT order in binance
    const binanceOrderData = {
        symbol: order.symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        quantity: quantity,
        price: price,
        stopPrice: price
    };

    const fee = Math.round(client.commission * price * quantity * maxPrecision) / maxPrecision;
    const feeCurrency = currencyPair.secondCurrency;
    // @todo - convert to BNB if feeCurrency is not BNB

    const orderData = {
        clientId: order.clientId,
        dealId: order.dealId,
        symbol: order.symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        status: 'NEW',
        price,
        quantity,
        fee,
        feeCurrency,
        credit: Math.round(price * quantity * maxPrecision) / maxPrecision,
        creditCurrency: currencyPair.secondCurrency,
        debit: quantity,
        debitCurrency: currencyPair.firstCurrency
    };

    return {
        binanceOrderData,
        orderData
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = main;
} else {
    module.exports = {
        main,
        placeNewStopLossOrder,
        prepareData
    }
}

