const R = require('ramda');
const debug = require('debug')('bnb:workers:open-deal');
const {Deal, Order} = require('./../models');
const binanceHelper = require('./../helpers/binance');
const errorHandler = require('../helpers/error-handler');

// 0. prepare context
// 1. validate balance
// 2. create new deal
// 3. place buy order in binance
// 4. create new buy orders
async function openDeal(task) {
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

function prepareDealData({marketPrice, tradePair, currencyPair, algorithm}) {
    const precision = Math.pow(10, currencyPair.secondCurrencyPrecision);
    const openPrice = Math.round(marketPrice * precision) / precision;
    let minProfitPrice = marketPrice + marketPrice * tradePair.additionPercentage;
    minProfitPrice = Math.round(minProfitPrice * precision) / precision;

    return {
        clientId: tradePair.clientId,
        symbol: tradePair.symbol,
        openPrice: openPrice,
        quantity: tradePair.dealQty,
        minProfitPrice,
        status: 'NEW',
        algorithm: algorithm
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
        credit: binanceOrder.quantity,
        creditCurrency: currencyPair.firstCurrency,
        debit: Math.round(binanceOrder.price * binanceOrder.quantity * precision) / precision,
        debitCurrency: currencyPair.secondCurrency,
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = openDeal;
} else {
    module.exports = {
        openDeal,
        prepareDealData,
        prepareBinanceOrderData,
        prepareOrderData
    }
}
