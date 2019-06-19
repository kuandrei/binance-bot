const dbHelpers = require('./../helpers/db');
const binanceHelpers = require('./../helpers/binance');

module.exports = {

    index: async (req, res, next) => {
        try {
            const results = await dbHelpers.getMinProfitPriceBySymbol();
            const promiseList = results.map(async (res) => {
                res.marketPrice = await binanceHelpers.symbolMarketPrice(res.symbol);
                return res;
            });
            res.json(await Promise.all(promiseList));
        } catch (err) {
            console.log('Unable to connect to the database:', err);
            next(err);
        }
    }
};
