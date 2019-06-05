const {Client} = require('./../models');
const Binance = require('binance-api-node').default;
const publicClient = Binance();

module.exports = {

    initApiClient: async (clientId) => {

        let client = await Client.findByPk(clientId);
        if (!client)
            throw new Error(`No api settings found for client#${clientId}`);

        return Binance({
            apiKey: client.apiKey,
            apiSecret: client.apiSecret
        });
    },

    symbolMarketPrice: async (symbol) => {
        const prices =  await publicClient.prices();
        return parseFloat(prices[symbol]);
    }
};