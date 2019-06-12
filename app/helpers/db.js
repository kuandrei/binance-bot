const async = require('async');
const {Deal, sequelize} = require('./../models');

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

    return await async.map(results, async item => await Deal.findByPk(item.id));
};

module.exports = {
    getActiveSymbols,
    findNewProfitDeals
};