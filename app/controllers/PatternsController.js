const {SymbolInfo, Sequelize} = require('./../models');

module.exports = {

    find: async (req, res, next) => {
        const symbol = req.query.symbol;
        const interval = req.query.interval;
        const pattern = req.query.pattern;
        const period = req.query.period; // days
        try {
            const data = await SymbolInfo.findAll({
                where: {
                    symbol,
                    createdAt: {
                        [Sequelize.Op.gt]: new Date(new Date().getTime() - (period * 24 * 60 * 60 * 1000))
                    }
                },
                attributes: ['id', 'symbol', 'marketPrice', 'candles', 'patterns', 'createdAt'],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            const symbolInfo = data.find(item => {
                return item.patterns.find(p => {
                    return p.interval === interval && p.data.CandlestickPattern[pattern];
                })
            });

            if (!symbolInfo)
                return res.json(null);

            const priceBefore = await SymbolInfo.findAll({
                where: {
                    symbol,
                    id: {
                        [Sequelize.Op.lt]: symbolInfo.id
                    }
                },
                attributes: ['id', 'marketPrice', 'createdAt'],
                order: [
                    ['id', 'DESC']
                ],
                limit: 10
            });

            const priceAfter = await SymbolInfo.findAll({
                where: {
                    symbol,
                    id: {
                        [Sequelize.Op.gt]: symbolInfo.id
                    }
                },
                attributes: ['id', 'marketPrice', 'createdAt'],
                order: [
                    ['id', 'ASC']
                ],
                limit: 10
            });
            return res.json({
                symbolInfo: {
                    id: symbolInfo.id,
                    symbol: symbolInfo.symbol,
                    marketPrice: symbolInfo.marketPrice,
                    candles: symbolInfo.candles.find(c => c.interval === interval).data.slice(-5),
                    createdAt: symbolInfo.createdAt
                },
                priceLine: {
                    before: priceBefore.map(p => p.marketPrice).reverse(),
                    after: priceAfter.map(p => p.marketPrice)
                }
            });


        } catch (err) {
            console.log('Unable to connect to the database:', err);
            next(err);
        }
    }
};
