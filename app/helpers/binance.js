const async = require('async');
const {Client} = require('./../models');
const Binance = require('binance-api-node').default;
const publicClient = Binance();
const testMode = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development');

async function initApiClient(clientId) {

    let client = await Client.findByPk(clientId);
    if (!client)
        throw new Error(`No api settings found for client#${clientId}`);

    return Binance({
        apiKey: client.apiKey,
        apiSecret: client.apiSecret
    });
}

async function order(clientId, data) {
    const authorizedApiClient = await initApiClient(clientId);
    if (testMode) {
        const order = await authorizedApiClient.orderTest(data);
        order.orderId = Date.now();
        return order;
    }
    return authorizedApiClient.order(data);
}

async function cancelOrder(clientId, symbol, orderId) {
    const authorizedApiClient = await initApiClient(clientId);
    if (testMode) {
        return true;
    }
    return authorizedApiClient.cancelOrder({
        symbol,
        orderId
    });
}

async function allOrders(clientId, symbol) {
    const authorizedApiClient = await initApiClient(clientId);
    return authorizedApiClient.allOrders({
        symbol
    });
}

async function symbolMarketPrice(symbol) {
    const prices = await publicClient.prices();
    if (Array.isArray(symbol)) {
        return async.map(symbol, async s => ({
            symbol: s,
            marketPrice: parseFloat(prices[s])
        }));
    } else {
        return parseFloat(prices[symbol]);
    }
}

async function getClientBalances(clientId) {
    const authorizedApiClient = await initApiClient(clientId);
    const result = await authorizedApiClient.accountInfo();
    return result.balances.map(balance => ({
        asset: balance.asset,
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
    }));
}

/**
 *
 * @param args
 * @return {Promise.<*>}
 */
async function getCandles(args) {
    return publicClient.candles(args);
}

module.exports = {
    initApiClient,
    order,
    cancelOrder,
    allOrders,
    symbolMarketPrice,
    getClientBalances,
    getCandles
};