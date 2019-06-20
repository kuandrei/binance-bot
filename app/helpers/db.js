const async = require('async');
const {Deal, Order, sequelize} = require('./../models');

const getActiveSymbols = async () => {
    const results = await sequelize.query(`
        SELECT DISTINCT symbol 
        FROM Deals 
        WHERE Deals.status IN ('OPEN', 'NEW');
    `, {type: sequelize.QueryTypes.SELECT});
    return results.map(item => item.symbol);
};

const findNewProfitDeals = async (symbol, marketPrice) => {
    const results = await sequelize.query(`
        SELECT Deals.id
        FROM Deals
        LEFT JOIN Orders ON Orders.dealId=Deals.id
        WHERE Deals.status='OPEN'
        AND Deals.symbol=:symbol
        AND Deals.minProfitPrice < :marketPrice
        GROUP BY Deals.id
        HAVING COUNT(1) = 1;
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {symbol, marketPrice}
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

module.exports = {
    getActiveSymbols,
    findNewProfitDeals,
    findOpenStopLossOrder,
    getMinProfitPrice
};