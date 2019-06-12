const R = require('ramda');
const debug = require('debug')('bnb:workers:open-deal');
const {Deal, Order} = require('./../models');
const binanceHelper = require('./../helpers/binance');

// 0. prepare context
// 1. validate balance
// 2. create new deal
// 3. place buy order in binance
// 4. create new buy orders
async function main(task) {
    const ctx = task.data;

    console.log('-----------------------------');
    console.dir(ctx, {colors: true, depth: 1});
    console.log('-----------------------------');

    debug(`open-order worker (trade-pair#${ctx.tradePair.id})`);

    // 0. prepare context
    // 1. validate balance
    // 2. create new deal
    // 3. place buy order in binance
    // 4. create new buy order

    try {

        // validate balance
        //
        // const buyQty = ctx.tradePair.dealQty + ctx.tradePair.dealQty * ctx.tradePair.additionPercentage;
        // let precision = Math.pow(10, ctx.currencyPair.secondCurrencyPrecision);
        // const dealPrice = Math.round(ctx.marketPrice * buyQty * precision) / precision;
        //
        //
        // if (ctx.balances[dealCurrency] < dealPrice) {
        //     debug('Not enough funds for opening new deal (trade-pair#${ctx.tradePair.id})');
        //     return;
        // }

        // prepare data
        const dealData = prepareDealData(ctx);
        const binanceOrderData = prepareBinanceOrderData(ctx);
        const orderData = prepareOrderData(R.merge({
            binanceOrder: binanceOrderData
        }, ctx));

        // validate balance
        const dealCurrency = ctx.currencyPair.secondCurrency;
        if (ctx.balances[dealCurrency] < binanceOrderData.price * binanceOrderData.quantity) {
            debug('Not enough funds for opening new deal (trade-pair#${ctx.tradePair.id})');
            return;
        }

        // open/create new deal
        debug(`add new deal (trade-pair#${ctx.tradePair.id})`);
        const deal = await Deal.create(dealData);

        // place buy order in binance
        // debug(`place binance buy order: ${buyQty} ${ctx.currencyPair.firstCurrency} for ${dealPrice} ${ctx.currencyPair.secondCurrency} (trade-pair#${ctx.tradePair.id})`);
        const binanceOrder = await binanceHelper.order(ctx.clientId, binanceOrderData);

        // create new buy order
        orderData.binanceOrderId = binanceOrder.id;
        orderData.dealId = deal.id;

        debug(`create new order (trade-pair#${ctx.tradePair.id})`);
        await Order.create(orderData);

    } catch (err) {
        debug(`new order worker failed with error '${err.message}' (trade-pair#${ctx.tradePair.id})`);
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
    module.exports = main;
} else {
    module.exports = {
        main,
        prepareDealData,
        prepareBinanceOrderData,
        prepareOrderData
    }
}
