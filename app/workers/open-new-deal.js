const R = require('ramda');
const debug = require('debug')('bnb:workers:open-deal');
const {Deal, Order} = require('./../models');
const binanceHelper = require('./../helpers/binance');
const errorHandler = require('../helpers/error-handler');

/**
 *
 * @param task (task.data contains {tradePair, algorithm, marketPrice})
 * @return {Promise.<{binanceOrder: *, order: *, deal: *}>}
 */
async function main(task) {
    const ctx = task.data;

    // 0. prepare context
    // 1. validate balance
    // 2. create new deal
    // 3. place buy order in binance
    // 4. create new buy order

    let dealData, binanceOrderData, orderData;

    try {

        // prepare data
        dealData = prepareDealData(ctx);
        binanceOrderData = prepareBinanceOrderData(ctx);
        orderData = prepareOrderData(R.merge({
            binanceOrder: binanceOrderData
        }, ctx));

        // validate balance
        const dealCurrency = ctx.currencyPair.secondCurrency;
        if (ctx.balances[dealCurrency].free < binanceOrderData.price * binanceOrderData.quantity) {
            //debug('NOT ENOUGH FUNDS FOR OPENING NEW DEAL (TRADE-PAIR#${ctx.tradePair.id})');
            return;
        }

        // open/create new deal
        debug(`ADD NEW DEAL (CLIENT ID#${ctx.tradePair.clientId}/SYMBOL:${orderData.symbol}/QTY:${orderData.quantity}/PRICE:${binanceOrderData.price})`);
        const deal = await Deal.create(dealData);

        // debug(`place binance buy order: ${buyQty} ${ctx.currencyPair.firstCurrency} for ${dealPrice} ${ctx.currencyPair.secondCurrency} (trade-pair#${ctx.tradePair.id})`);
        const binanceOrder = await binanceHelper.order(ctx.clientId, binanceOrderData);
        // create new buy order
        orderData.binanceOrderId = binanceOrder.orderId;
        orderData.dealId = deal.id;

        const order = await Order.create(orderData);

        return {
            binanceOrder,
            order,
            deal
        };

    } catch (err) {
        errorHandler(err, {taskData: task.data, dealData, binanceOrderData, orderData});
        debug(`ERROR: ${err.message}`);
    }
}

/**
 *
 * @param marketPrice
 * @param tradePair
 * @param exchangeInfo
 * @param algorithm
 * @return {{clientId: number, symbol: (string|string), openPrice: number, quantity: number, minProfitPrice: *, status: string, algorithm: *}}
 */
function prepareDealData({marketPrice, tradePair, exchangeInfo, algorithm}) {

    let buyQty, sellQty, minProfitPrice;
    let stepSizePrecision = 1, tickSizePrecision = 1;

    const priceFilter = exchangeInfo.filters.find(filter => filter.filterType === 'PRICE_FILTER');
    if (priceFilter && priceFilter.tickSize !== 0)
        tickSizePrecision = 1 / priceFilter.tickSize;

    const lotSizeFilter = exchangeInfo.filters.find(filter => filter.filterType === 'LOT_SIZE');
    if (lotSizeFilter && lotSizeFilter.stepSize !== 0)
        stepSizePrecision = 1 / lotSizeFilter.stepSize;


    switch (tradePair.profitOn) {
        case 'BASE_ASSET':
            buyQty = Math.ceil((tradePair.dealQty + tradePair.dealQty * tradePair.minProfitRate) * stepSizePrecision) / stepSizePrecision;
            sellQty = tradePair.dealQty;
            minProfitPrice = Math.ceil(marketPrice * buyQty / sellQty * tickSizePrecision) / tickSizePrecision;
            break;
        case 'QUOTE_ASSET':
            buyQty = tradePair.dealQty;
            sellQty = tradePair.dealQty; // ???
            break;
        case 'BOTH':
            break;
    }

    return {
        clientId: tradePair.clientId,
        symbol: tradePair.symbol,
        buyQty,
        sellQty,
        openPrice: marketPrice,
        minProfitPrice,
        status: 'NEW',
        algorithm
    };
}

function prepareBinanceOrderData({marketPrice, tradePair, currencyPair}) {
    const buyQty = tradePair.dealQty + tradePair.dealQty * tradePair.additionPercentage;
    const precision = Math.pow(10, currencyPair.secondCurrencyPrecision);
    const price = Math.round(marketPrice * precision) / precision;
    return {
        symbol: tradePair.symbol,
        side: 'BUY',
        type: 'LIMIT',
        quantity: buyQty,
        price: price
    };
}

function prepareOrderData({client, currencyPair, binanceOrder}) {
    const precision = Math.pow(10, 8);
    return {
        clientId: client.id,
        symbol: currencyPair.symbol,
        side: 'BUY',
        type: 'LIMIT',
        status: 'NEW',
        price: binanceOrder.price,
        quantity: binanceOrder.quantity,
        fee: Math.round(binanceOrder.quantity * client.commission * precision) / precision,
        feeCurrency: currencyPair.firstCurrency,
        credit: binanceOrder.quantity,
        creditCurrency: currencyPair.firstCurrency,
        debit: Math.round(binanceOrder.price * binanceOrder.quantity * precision) / precision,
        debitCurrency: currencyPair.secondCurrency,
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = main;
} else {
    module.exports = {
        main,
        prepareDealData,
        prepareBinanceOrderData,
        prepareOrderData
    }
}
