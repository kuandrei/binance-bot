const async = require('async');
const debug = require('debug')('bnb:workers:add-stop-loss-orders');
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

    debug('check open orders worker started');

    const symbols = await dbHelpers.getActiveSymbols();
    const symbolsWithMarketPrice = await getSymbolsWithMarketPrice(symbols);

    async.eachSeries(symbolsWithMarketPrice, async item => {
        const deals = await dbHelpers.findNewProfitDeals(item.symbol, item.marketPrice);
        async.eachSeries(deals, async deal => {
            await addStopLossOrder({deal, symbol: item.symbol, marketPrice: item.marketPrice})
        })
    });
}

async function getSymbolsWithMarketPrice(symbols) {
    return async.map(symbols, async (symbol) => {
        return {
            symbol,
            marketPrice: await binanceHelpers.symbolMarketPrice(symbol)
        };
    });
}

/**
 *
 * @param ctx - {deal, symbol, marketPrice}
 * @return {Promise.<void>}
 */
async function addStopLossOrder(ctx) {

    const {
        placeOrderData,
        orderCreationData
    } = prepareSellOrderData(ctx);

    // debug(`place binance stop_limit_order order: ${orderCreationData.quantity} ${placeOrderData.firstCurrency} for ${dealPrice} ${ctx.currencyPair.secondCurrency} (trade-pair#${ctx.tradePair.id})`);
    const binanceOrder = await binanceHelpers.order(ctx.deal.clientId, placeOrderData);

    orderCreationData.binanceOrderId = binanceOrder.id;
    debug(`create new order (trade-pair#${ctx.tradePair.id})`);
    await Order.create(orderCreationData);
}

async function prepareSellOrderData({deal, symbol, marketPrice}) {

    // prepare context
    const client = await Client.findByPk(deal.clientId);
    client.commission = parseFloat(client.commission);
    const currencyPair = await CurrencyPair.findOne({
        where: {symbol}
    });
    const maxPrecision = Math.pow(10, 8);
    const precision = Math.pow(10, currencyPair.secondCurrencyPrecision);
    const quantity = deal.quantity;
    const price = Math.round((deal.minProfitPrice + marketPrice) / 2 * precision) / precision;

    // place STOP_LOSS_LIMIT order in binance
    const placeOrderData = {
        symbol: symbol,
        side: 'SELL',
        type: 'STOP_LOSS_LIMIT',
        quantity: quantity,
        price: price,
        stopPrice: price
    };

    const fee = Math.round(client.commission * price * quantity * maxPrecision) / maxPrecision;
    const feeCurrency = currencyPair.secondCurrency;
    // @todo - convert to BNB if feeCurrency is not BNB

    const orderCreationData = {
        clientId: deal.clientId,
        dealId: deal.id,
        symbol: symbol,
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
        placeOrderData,
        orderCreationData
    };
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = main;
} else {
    module.exports = {
        main,
        getSymbolsWithMarketPrice,
        addStopLossOrder,
        prepareSellOrderData
    }
}

