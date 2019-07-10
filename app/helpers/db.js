const async = require('async');
const {
    Deal,
    Order,
    ExchangeInfo,
    sequelize,
    Sequelize
} = require('./../models');

const getTradingSymbols = async () => {
    const results = await sequelize.query(`
        SELECT DISTINCT symbol 
        FROM Deals 
        WHERE Deals.status IN ('OPEN', 'NEW')
        UNION DISTINCT
        SELECT DISTINCT symbol 
        FROM TradePairs 
        WHERE TradePairs.status='ACTIVE'  
    `, {type: sequelize.QueryTypes.SELECT});
    return results.map(item => item.symbol);
};

const findNewProfitDeals = (type) => async (symbol, price) => {
    const results = await sequelize.query(`
        SELECT Deals.id
        FROM Deals
        LEFT JOIN Orders ON Orders.dealId=Deals.id AND Orders.status IN ('NEW', 'PARTIALLY_FILLED')
        WHERE Deals.status='OPEN'
        AND Deals.symbol=:symbol
        AND Deals.type=:type
        AND Deals.minProfitPrice ${type === 'UPTREND' ? '<' : '>'} :price
        GROUP BY Deals.id
        HAVING COUNT(1) = 1;
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {symbol, type, price}
    });

    return await async.map(results, async d => await Deal.findByPk(d.id));
};

const findOpenStopLossOrder = async (symbol, marketPrice) => {
    const results = await sequelize.query(`
        SELECT Orders.id
        FROM Orders
        WHERE Orders.status='NEW'
        AND Orders.side='SELL'
        AND Orders.type='STOP_LOSS_LIMIT'
        AND Orders.symbol=:symbol
        AND Orders.price < :marketPrice
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {symbol, marketPrice}
    });

    return await async.map(results, async o => await Order.findByPk(o.id));
};

const findOpenTakeProfitOrder = async (symbol, marketPrice) => {
    const results = await sequelize.query(`
        SELECT Orders.id
        FROM Orders
        WHERE Orders.status='NEW'
        AND Orders.side='BUY'
        AND Orders.type='TAKE_PROFIT_LIMIT'
        AND Orders.symbol=:symbol
        AND Orders.price > :marketPrice
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {symbol, marketPrice}
    });

    return await async.map(results, async o => await Order.findByPk(o.id));
};

const getMinProfitPrice = async (clientId, symbol) => {
    const result = await sequelize.query(`
        SELECT MIN(minProfitPrice) AS minProfitPrice
        FROM Deals WHERE status='OPEN'
        AND clientId=:clientId
        AND symbol=:symbol
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {clientId, symbol}
    });
    return result[0].minProfitPrice;
};

const getNumberOfOpenAlgoOrders = async (clientId, symbol) => {
    return await Order.count({
        where: {
            clientId,
            symbol,
            status: {
                [Sequelize.Op.in]: [
                    'NEW',
                    'ACTIVE',
                    'PARTIALLY_FILLED'
                ]
            },
            type: {
                [Sequelize.Op.in]: [
                    'STOP_LOSS',
                    'STOP_LOSS_LIMIT',
                    'TAKE_PROFIT',
                    'TAKE_PROFIT_LIMIT'
                ]
            }
        }
    });
};

const getExchangeInfoMap = async symbols => {
    const exchangeInfo = await ExchangeInfo.findAll({
        where: {
            symbol: {
                [Sequelize.Op.in]: symbols
            }
        }
    });
    return exchangeInfo.reduce((map, info) => {
        map[info.symbol] = info.toJSON();
        return map;
    }, {});
};

module.exports = {
    getTradingSymbols,
    findNewProfitDeals,
    findOpenStopLossOrder,
    findOpenTakeProfitOrder,
    getMinProfitPrice,
    getNumberOfOpenAlgoOrders,
    getExchangeInfoMap
};