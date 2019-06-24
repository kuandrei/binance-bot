const async = require('async');
const debug = require('debug')('bnb:workers:add-stop-loss-orders');
const errorHandler = require('../helpers/error-handler');
const dbHelpers = require('../helpers/db');
const binanceHelpers = require('../helpers/binance');
const {Client, Order, CurrencyPair} = require('../models');

/**
 * 1. find all active symbols
 * 2. get market price for each symbol
 * 3. find all new profit deals
 * 4. add STOP_LOSS orders
 */
async function main() {

    const symbols = await dbHelpers.getActiveSymbols();
    const symbolsWithMarketPrice = await binanceHelpers.symbolMarketPrice(symbols);

    async.eachSeries(symbolsWithMarketPrice, async item => {
        //subtract 0.05 % from marketPrice to lower the chance the stop loss order will be triggered just after was added
        const priceToCompareTo = item.marketPrice - item.marketPrice * 0.0005;
        const deals = await dbHelpers.findNewProfitDeals(item.symbol, priceToCompareTo);
        async.eachSeries(deals, async deal => {
            await addStopLossOrder({deal, symbol: item.symbol, stopLossPrice: priceToCompareTo})
        })
    });
}

/**
 *
 * @param ctx - {deal, symbol, marketPrice}
 * @return {Promise.<void>}
 */
async function addStopLossOrder(ctx) {

    try {
        const {
            binanceOrderData,
            orderData
        } = await prepareData(ctx);

        debug(`ADD STOP_LOSS_LIMIT ORDER (DEAL#${ctx.deal.id}/${orderData.symbol}/QTY:${orderData.quantity}/PRICE:${binanceOrderData.price})`);

        const binanceOrder = await binanceHelpers.order(ctx.deal.clientId, binanceOrderData);

        orderData.binanceOrderId = binanceOrder.orderId;
        const order = await Order.create(orderData);

        return {
            binanceOrder,
            order
        };
    } catch (err) {
        errorHandler(err, ctx);
        debug(`ERROR: ${err.message}`);
    }
}

async function prepareData({deal, symbol, stopLossPrice}) {

    // prepare context
    const client = await Client.findByPk(deal.clientId);
    client.commission = parseFloat(client.commission);
    const currencyPair = await CurrencyPair.findOne({
        where: {symbol}
    });
    const maxPrecision = Math.pow(10, 8);
    const precision = Math.pow(10, currencyPair.secondCurrencyPrecision);
    const quantity = parseFloat(deal.quantity);
    const price = Math.round(stopLossPrice * precision) / precision;

    // place STOP_LOSS_LIMIT order in binance
    const binanceOrderData = {
        symbol: symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        quantity: quantity,
        price: price,
        stopPrice: price
    };

    // @todo - convert to BNB if feeCurrency is not BNB

    const orderData = {
        clientId: deal.clientId,
        dealId: deal.id,
        symbol: symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        status: 'NEW',
        price,
        quantity,
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
        addStopLossOrder,
        prepareData
    }
}

