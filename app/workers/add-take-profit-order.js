const debug = require('debug')('bnb:workers:add-take-profit-order');
const errorHandler = require('../helpers/error-handler');
const binanceHelpers = require('../helpers/binance');
const {Order, ExchangeInfo} = require('../models');

async function addTakeProfitOrder(task) {

    try {
        const {deal, takeProfitPrice} = task.data;
        // @todo - ensure the same deal not added twice to queue

        const {
            binanceOrderData,
            orderData
        } = await prepareData({deal, takeProfitPrice});

        debug(`ADD TAKE_PROFIT_LIMIT ORDER (DEAL#${deal.id}/${deal.symbol}/QTY:${deal.buyQty}/PRICE:${binanceOrderData.price})`);

        const binanceOrder = await binanceHelpers.order(deal.clientId, binanceOrderData);
        console.log('-----------------------------');
        console.dir({binanceOrderData, binanceOrder}, {colors: true, depth: 5});
        console.log('-----------------------------');
        orderData.binanceOrderId = binanceOrder.orderId;
        const order = await Order.create(orderData);

        return {
            binanceOrder,
            order
        };
    } catch (err) {
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
    }
}

async function prepareData({deal, takeProfitPrice}) {

    // prepare context
    const exchangeInfo = await ExchangeInfo.findOne({
        where: {symbol: deal.symbol}
    });
    let tickSizePrecision = 1;
    const priceFilter = exchangeInfo.filters.find(filter => filter.filterType === 'PRICE_FILTER');
    if (priceFilter && priceFilter.tickSize !== 0)
        tickSizePrecision = 1 / priceFilter.tickSize;
    const maxPrecision = Math.pow(10, 8);
    const price = Math.ceil(takeProfitPrice * tickSizePrecision) / tickSizePrecision;

    const binanceOrderData = {
        symbol: deal.symbol,
        side: 'BUY',
        type: 'TAKE_PROFIT_LIMIT',
        quantity: deal.buyQty,
        price: price,
        stopPrice: price
    };

    const orderData = {
        clientId: deal.clientId,
        dealId: deal.id,
        symbol: deal.symbol,
        side: 'BUY',
        type: 'TAKE_PROFIT_LIMIT',
        status: 'NEW',
        price,
        quantity: deal.buyQty,
        credit: deal.buyQty,
        creditCurrency: exchangeInfo.baseAsset,
        debit: Math.round(price * deal.buyQty * maxPrecision) / maxPrecision,
        debitCurrency: exchangeInfo.quoteAsset
    };

    return {
        binanceOrderData,
        orderData
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = addTakeProfitOrder;
} else {
    module.exports = {
        addTakeProfitOrder,
        prepareData
    }
}

