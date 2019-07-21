const {ExchangeInfo, SymbolInfo} = require('./../models');

module.exports = {

    symbol: async (req, res, next) => {
        try {
            const symbol = req.query.symbol;
            if (!symbol)
                return res.status(400).send('Symbol must be provided');
            res.json(await SymbolInfo.findOne({
                where: {
                    symbol
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            }));
        } catch (err) {
            next(err);
        }
    },

    exchange: async (req, res, next) => {
        try {
            const symbol = req.query.symbol;
            if (!symbol)
                return res.status(400).send('Symbol must be provided');
            res.json(await ExchangeInfo.findOne({
                where: {
                    symbol
                }
            }));
        } catch (err) {
            next(err);
        }
    }
};
