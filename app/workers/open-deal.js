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

    debug(`OPEN-ORDER WORKER (TRADE-PAIR#${ctx.tradePair.id})`);

    // 0. prepare context
    // 1. validate balance
    // 2. create new deal
    // 3. place buy order in binance
    // 4. create new buy order

    try {

        // prepare data
        const dealData = prepareDealData(ctx);
        const binanceOrderData = prepareBinanceOrderData(ctx);
        const orderData = prepareOrderData(R.merge({
            binanceOrder: binanceOrderData
        }, ctx));

        // validate balance
        const dealCurrency = ctx.currencyPair.secondCurrency;
        if (ctx.balances[dealCurrency] < binanceOrderData.price * binanceOrderData.quantity) {
            debug('NOT ENOUGH FUNDS FOR OPENING NEW DEAL (TRADE-PAIR#${ctx.tradePair.id})');
            return;
        }

        // open/create new deal
        debug(`ADD NEW DEAL (TRADE-PAIR#${ctx.tradePair.id})`);
        const deal = await Deal.create(dealData);

        // place buy order in binance
        debug(`ADD BUY ORDER (SYMBOL:${orderData.symbol}/QTY:${orderData.quantity}/PRICE:${binanceOrderData.price}/TRADE-PAIR#${ctx.tradePair.id})`);

        // debug(`place binance buy order: ${buyQty} ${ctx.currencyPair.firstCurrency} for ${dealPrice} ${ctx.currencyPair.secondCurrency} (trade-pair#${ctx.tradePair.id})`);
        const binanceOrder = await binanceHelper.order(ctx.clientId, binanceOrderData);
        console.log('-----------------------------');
        console.dir(binanceOrder, {colors: true, depth: 5});
        console.log('-----------------------------');
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
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
    }
}

function prepareDealData({marketPrice, tradePair, currencyPair}) {
    let minProfitPrice = marketPrice + marketPrice * tradePair.additionPercentage;
    const precision = Math.pow(10, currencyPair.secondCurrencyPrecision);
    minProfitPrice = Math.round(minProfitPrice * precision) / precision;

    return {
        clientId: tradePair.clientId,
        symbol: tradePair.symbol,
        openPrice: marketPrice,
        quantity: tradePair.dealQty,
        minProfitPrice,
        status: 'NEW'
    };
}

function prepareBinanceOrderData({marketPrice, tradePair}) {
    const buyQty = tradePair.dealQty + tradePair.dealQty * tradePair.additionPercentage;
    return {
        symbol: tradePair.symbol,
        side: 'BUY',
        type: 'LIMIT',
        quantity: buyQty,
        price: marketPrice
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
    module.exports = openDeal;
} else {
    module.exports = {
        openDeal,
        prepareDealData,
        prepareBinanceOrderData,
        prepareOrderData
    }
}
