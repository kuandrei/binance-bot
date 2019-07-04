const debug = require('debug')('bnb:workers:add-stop-loss-orders');
const errorHandler = require('../helpers/error-handler');
const binanceHelpers = require('../helpers/binance');
const {Order, ExchangeInfo} = require('../models');

async function addStopLossOrder({deal, stopLossPrice}) {

    try {
        // @todo - ensure the same deal not added twice to queue

        const {
            binanceOrderData,
            orderData
        } = await prepareData({deal, stopLossPrice});

        debug(`ADD STOP_LOSS_LIMIT ORDER (DEAL#${deal.id}/${deal.symbol}/QTY:${deal.sellQty}/PRICE:${binanceOrderData.price})`);

        const binanceOrder = await binanceHelpers.order(deal.clientId, binanceOrderData);

        orderData.binanceOrderId = binanceOrder.orderId;
        const order = await Order.create(orderData);

        return {
            binanceOrder,
            order
        };
    } catch (err) {
        errorHandler(err, {deal, stopLossPrice});
        debug(`ERROR: ${err.message}`);
    }
}

async function prepareData({deal, stopLossPrice}) {

    // prepare context
    const exchangeInfo = await ExchangeInfo.findOne({
        where: {symbol: deal.symbol}
    });
    let tickSizePrecision = 1;
    const priceFilter = exchangeInfo.filters.find(filter => filter.filterType === 'PRICE_FILTER');
    if (priceFilter && priceFilter.tickSize !== 0)
        tickSizePrecision = 1 / priceFilter.tickSize;
    const maxPrecision = Math.pow(10, 8);
    const price = Math.ceil(stopLossPrice * tickSizePrecision) / tickSizePrecision;

    const binanceOrderData = {
        symbol: deal.symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        quantity: deal.sellQty,
        price: price,
        stopPrice: price
    };

    const orderData = {
        clientId: deal.clientId,
        dealId: deal.id,
        symbol: deal.symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        status: 'NEW',
        price,
        quantity: deal.sellQty,
        credit: Math.round(price * deal.sellQty * maxPrecision) / maxPrecision,
        creditCurrency: exchangeInfo.quoteAsset,
        debit: deal.sellQty,
        debitCurrency: exchangeInfo.baseAsset
    };

    return {
        binanceOrderData,
        orderData
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = addStopLossOrder;
} else {
    module.exports = {
        addStopLossOrder,
        prepareData
    }
}

