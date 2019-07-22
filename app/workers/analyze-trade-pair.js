const debug = require('debug')('bnb:workers:analyze-trade-pair');
const redlock = require('../helpers/redlock');
const statsHelpers = require('./../helpers/stats');
const applyFilter = require('loopback-filters');
const Queue = require('bull');
const openNewDealQueue = new Queue('open-new-deal', 'redis://redis:6379');
const errorHandler = require('../helpers/error-handler');

const {
    TradePair,
    TradeRestriction,
    SymbolInfo,
    ExchangeInfo
} = require('./../models');

/**
 * flow:
 *
 * 1. load symbol info
 * 2. load trade pair info
 * 3. load exchange info
 * 4. check balance
 * 5. check restrictions
 * 6. check triggers
 * 7. add open-new-deal task
 *
 * @param task
 */
async function worker(task) {
    const taskData = task.data;

    const lock = await redlock.lock(`analyze-trade-pair:pair:${taskData.id}`, 15000/*15 sec*/);

    try {

        const tradePair = await TradePair.findOne({
            where: {
                id: taskData.id
            },
            include: {
                association: 'rules',
                include: 'conditions',
                where: {
                    status: 'ACTIVE'
                }
            }
        });

        // load symbol info
        const symbolInfo = await SymbolInfo.findOne({
            where: {
                symbol: tradePair.symbol
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });

        if (!symbolInfo) {
            debug(`NO SYMBOL INFO FOUND (${tradePair.symbol})`);
            await lock.unlock();
            return tradePair;
        }

        // check the symbolInfo is not outdated (max 5 minutes)
        if (process.env.NODE_ENV !== 'test' && symbolInfo.createdAt < new Date(new Date().getTime() - (5 * 60 * 1000))) {
            debug(`SYMBOL INFO IS OUTDATED (${tradePair.symbol})`);
            await lock.unlock();
            return tradePair;
        }

        // load trade pair info
        const tradePairInfo = await statsHelpers.tradePairInfo(tradePair, symbolInfo);

        // load exchange info
        const exchangeInfo = (await ExchangeInfo.findOne({
            where: {symbol: tradePair.symbol}
        })).toJSON();

        const rules = tradePair.rules.filter(r => r.type === (tradePair.tradeOn === 'UPTREND' ? 'BUY' : 'SELL'));
        const restrictions = await TradeRestriction.findAll({
            where: {clientId: tradePair.clientId}
        });

        const ctx = {
            tradePair,
            tradePairInfo,
            exchangeInfo,
            symbolInfo,
            restrictions,
            rules
        };

        // check balance
        if (!checkBalance(ctx)) {
            tradePair.tradeStatus = 'NOT ENOUGH FUNDS';
            await lock.unlock();
            return await tradePair.save();
        }

        // check restrictions
        const restriction = checkRestrictions(ctx);
        if (restriction) {
            tradePair.tradeStatus = `RESTRICTION: ${restriction.name}`;
            await lock.unlock();
            return await tradePair.save();
        }

        // check trade rules
        const rule = checkRules(ctx);
        if (rule) {

            // open deal here
            await openNewDealQueue.add({
                marketPrice: symbolInfo.marketPrice,
                tradePair: tradePair.toJSON(),
                type: tradePair.tradeOn,
                algorithm: rule.name,
                // algorithm: `RULE#${rule.id}/SYMBOL-INFO#${symbolInfo.id}/${rule.name}`
            });

            tradePair.tradeStatus = `${rule.type} - (ID:${rule.id}/NAME:${rule.name}/SYMBOL_INFO:${symbolInfo.id})`;
            await lock.unlock();
            return await tradePair.save();
        }

        tradePair.tradeStatus = 'NOTHING MATCHED';
        await lock.unlock();
        return await tradePair.save();

    } catch (err) {
        errorHandler(err, task.data);
        debug(`ERROR: ${err.message}`);
        return lock.unlock();
    }

}

function checkBalance({tradePair, tradePairInfo, exchangeInfo, symbolInfo}) {
    let dealCurrency, dealAmount;

    if (tradePair.tradeOn === 'UPTREND') {
        // dealCurrency: quoteAsset
        // amount:
        // 1. (profit in BASE_ASSET ) - (dealQty + dealQty * minProfitRate) * marketPrice
        // 2. (profit in QUOTE_ASSET) - dealQty * marketPrice
        dealCurrency = exchangeInfo.quoteAsset;
        dealAmount = tradePair.profitIn === 'BASE_ASSET' ?
            (tradePair.dealQty + tradePair.dealQty * tradePair.minProfitRate) * symbolInfo.marketPrice :
            tradePair.dealQty * symbolInfo.marketPrice;
    } else {
        // dealCurrency: baseAsset
        // amount:
        // 1. (profit in BASE_ASSET ) - dealQty
        // 2. (profit in QUOTE_ASSET) - (dealQty + dealQty * minProfitRate)
        dealCurrency = exchangeInfo.baseAsset;
        dealAmount = tradePair.dealQty;
    }

    const balance = tradePairInfo.balances[dealCurrency].free;
    return balance >= dealAmount;
}

function checkRestrictions({tradePairInfo, restrictions}) {

    return restrictions.find(restriction => {
        // apply filter
        let filter = {where: restriction.filter};
        const results = applyFilter([tradePairInfo], filter);
        // matched?
        return results.length > 0;
    });
}

function checkRules({symbolInfo, rules}) {

    return rules.find(rule => {
        let matched;
        if (rule.conditionMatch === 'ANY') {
            matched = rule.conditions.some(condition => {
                const patterns = symbolInfo.patterns.find(patterns => patterns.interval === condition.interval).data;
                let data = patterns[condition.indicator];
                let filter = {where: condition.filter};
                if (isNumeric(data) || isString(data)) {
                    filter.where = {};
                    filter.where[condition.indicator] = condition.filter;
                    data = {};
                    data[condition.indicator] = patterns[condition.indicator];
                }
                return applyFilter([data], filter).length > 0;
            });
        } else {
            matched = rule.conditions.every(condition => {
                const patterns = symbolInfo.patterns.find(patterns => patterns.interval === condition.interval).data;
                let data = patterns[condition.indicator];
                let filter = {where: condition.filter};
                if (isNumeric(data) || isString(data)) {
                    filter.where = {};
                    filter.where[condition.indicator] = condition.filter;
                    data = {};
                    data[condition.indicator] = patterns[condition.indicator];
                }
                return applyFilter([data], filter).length > 0;
            });
        }
        return matched;
    });
}

if (process.env.NODE_ENV !== 'test') {
    module.exports = worker;
} else {
    module.exports = {
        worker,
        checkBalance,
        checkRestrictions,
        checkRules
    }
}

function isNumeric(variable) {
    return typeof variable === 'number';
}

function isString(variable) {
    return typeof variable === 'string';
}