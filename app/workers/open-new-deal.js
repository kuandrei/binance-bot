const debug = require('debug')('bnb:workers:open-deal');
const {Deal, Order, ExchangeInfo} = require('./../models');
const binanceHelper = require('./../helpers/binance');
const errorHandler = require('../helpers/error-handler');

/**
 *
 * @param task (task.data contains {tradePair, algorithm, marketPrice})
 * @return {Promise.<{binanceOrder: *, order: *, deal: *}>}
 */
async function worker(task) {
    const {tradePair, algorithm, marketPrice} = task.data;

    // 0. prepare context
    // 1. validate balance
    // 2. create new deal
    // 3. place buy order in binance
    // 4. create new buy order

    let dealData, binanceOrderData, orderData;

    try {

        // prepare data
        const exchangeInfo = await ExchangeInfo.findOne({
            where: {symbol: tradePair.symbol}
        });
        dealData = prepareDealData({marketPrice, tradePair, exchangeInfo, algorithm});
        binanceOrderData = prepareBinanceOrderData({deal: dealData});
        orderData = prepareOrderData({deal: dealData, exchangeInfo});

        // validate balance
        // const dealCurrency = exchangeInfo.quoteAsset;
        // if (ctx.balances[dealCurrency].free < binanceOrderData.price * binanceOrderData.quantity) {
        //     //debug('NOT ENOUGH FUNDS FOR OPENING NEW DEAL (TRADE-PAIR#${ctx.tradePair.id})');
        //     return;
        // }

        // open/create new deal
        debug(`ADD NEW DEAL (CLIENT ID#${tradePair.clientId}/SYMBOL:${tradePair.symbol}/QTY:${dealData.buyQty}/PRICE:${marketPrice}/PROFIT:${dealData.minProfitPrice})`);
        const deal = await Deal.create(dealData);

        // debug(`place binance buy order: ${buyQty} ${ctx.currencyPair.firstCurrency} for ${dealPrice} ${ctx.currencyPair.secondCurrency} (trade-pair#${ctx.tradePair.id})`);
        const binanceOrder = await binanceHelper.order(tradePair.clientId, binanceOrderData);
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


    switch (tradePair.profitIn) {
        case 'BASE_ASSET':
            buyQty = Math.ceil((tradePair.dealQty + tradePair.dealQty * tradePair.minProfitRate) * stepSizePrecision) / stepSizePrecision;
            sellQty = tradePair.dealQty;
            minProfitPrice = Math.ceil(marketPrice * buyQty / sellQty * tickSizePrecision) / tickSizePrecision;
            break;
        case 'QUOTE_ASSET':
            buyQty = tradePair.dealQty;
            sellQty = tradePair.dealQty;
            minProfitPrice = Math.ceil((marketPrice + marketPrice * tradePair.minProfitRate) * tickSizePrecision) / tickSizePrecision;
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

function prepareBinanceOrderData({deal}) {
    return {
        symbol: deal.symbol,
        side: 'BUY',
        type: 'LIMIT',
        quantity: deal.buyQty,
        price: deal.openPrice
    };
}

function prepareOrderData({deal, exchangeInfo}) {
    const precision = Math.pow(10, 8);
    return {
        clientId: deal.clientId,
        symbol: deal.symbol,
        side: 'BUY',
        type: 'LIMIT',
        status: 'NEW',
        price: deal.openPrice,
        quantity: deal.buyQty,
        credit: deal.buyQty,
        creditCurrency: exchangeInfo.baseAsset,
        debit: Math.round(deal.openPrice * deal.buyQty * precision) / precision,
        debitCurrency: exchangeInfo.quoteAsset,
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = worker;
} else {
    module.exports = {
        worker,
        prepareDealData,
        prepareBinanceOrderData,
        prepareOrderData
    }
}
