const {ClientApiSettings} = require('./../models');
const Binance = require('binance-api-node').default;

module.exports = {

    initApiClient: async (clientId) => {

        let apiSettings = await ClientApiSettings.findOne({
            where: {clientId}
        });

        if (!apiSettings)
            throw new Error(`No api settings found for client#${clientId}`);

        apiSettings = apiSettings.toJSON();

        return Binance({
            apiKey: apiSettings.apiKey,
            apiSecret: apiSettings.apiSecret
        });
    }
};