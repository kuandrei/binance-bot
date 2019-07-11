const debug = require('debug')('bnb:workers:add-stop-loss-order');
const errorHandler = require('../helpers/error-handler');
const binanceHelpers = require('../helpers/binance');
const {Order, ExchangeInfo, Sequelize} = require('../models');
const redlock = require('../helpers/redlock');

async function addStopLossOrder(task) {
    const {deal, stopLossPrice} = task.data;

    const lock = await redlock.lock(`add-stop-loss-order:deal:${deal.id}`, 15000/*15 sec*/);
    try {

        const count = await Order.count({
            where: {
                dealId: deal.id,
                type: 'STOP_LOSS_ORDER',
                status: {
                    [Sequelize.Op.in]: ['NEW', 'PARTIALLY_FILLED', 'FILLED']
                }
            }
        });

        if (count !== 0) {
            debug(`SKIP ADD-STOP-LOSS-ORDER TASK FOR DEAL#${deal.id}`);
            lock.unlock();
            return;
        }

        const {
            binanceOrderData,
            orderData
        } = await prepareData({deal, stopLossPrice});

        const qty = deal.type === 'UPTREND' ? deal.sellQty : deal.buyQty;
        debug(`ADD STOP_LOSS_LIMIT ORDER (DEAL#${deal.id}/${deal.symbol}/QTY:${qty}/PRICE:${binanceOrderData.price})`);

        const binanceOrder = await binanceHelpers.order(deal.clientId, binanceOrderData);

        orderData.binanceOrderId = binanceOrder.orderId;
        const order = await Order.create(orderData);

        lock.unlock();
        return {
            binanceOrder,
            order
        };
    } catch (err) {
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
        lock.unlock();
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
        type: 'STOP_LOSS_LIMIT',
        price: price,
        stopPrice: price
    };

    const orderData = {
        clientId: deal.clientId,
        dealId: deal.id,
        symbol: deal.symbol,
        type: 'STOP_LOSS_LIMIT',
        status: 'NEW',
        price
    };
    if (deal.type === 'UPTREND') {
        binanceOrderData.side = 'SELL';
        binanceOrderData.quantity = deal.sellQty;
        orderData.side = 'SELL';
        orderData.quantity = deal.sellQty;
        orderData.credit = Math.round(price * deal.sellQty * maxPrecision) / maxPrecision;
        orderData.creditCurrency = exchangeInfo.quoteAsset;
        orderData.debit = deal.sellQty;
        orderData.debitCurrency = exchangeInfo.baseAsset;
    } else {
        binanceOrderData.side = 'BUY';
        binanceOrderData.quantity = deal.buyQty;
        orderData.side = 'BUY';
        orderData.quantity = deal.buyQty;
        orderData.credit = deal.buyQty;
        orderData.creditCurrency = exchangeInfo.baseAsset;
        orderData.debit = Math.round(price * deal.buyQty * maxPrecision) / maxPrecision;
        orderData.debitCurrency = exchangeInfo.quoteAsset;
    }

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

