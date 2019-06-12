const {Client} = require('./../models');
const Binance = require('binance-api-node').default;
const publicClient = Binance();

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
    if (process.env.NODE_ENV === 'test') {
        const order = authorizedApiClient.orderTest(data);
        order.id = Date.now();
        return order;
    }
    return authorizedApiClient.order(data);
}

async function symbolMarketPrice(symbol) {
    const prices = await publicClient.prices();
    return parseFloat(prices[symbol]);
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

async function getCandles(args) {
    return publicClient.candles(args);
}

module.exports = {
    initApiClient,
    order,
    symbolMarketPrice,
    getClientBalances,
    getCandles
};