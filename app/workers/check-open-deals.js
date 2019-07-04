/**
 * Checks if there are OPEN deals in profit  without STOP_LOSS order (UPTREND deals) or TAKE_PROFIT (DOWNTREND deals)
 * and adds appropriate task for every deal:
 * - Adds add-stop-loss-order task for UPTREND deals
 * - Adds add-take-profit-order task for DOWNTREND deals
 * - If the MAX_NUM_ALGO_ORDERS exceeded then ??? task added (currently SKIPS)
 *
 * flow:
 *
 * 1. load all trading symbols
 * 2. get market price for each symbol
 * 3. find all OPEN UPTREND deals with minProfitPrice < (marketPrice - 0.05%)
 * -  for each deal:
 *    - calculate NUM_ALGO_ORDERS for deal trade pair
 *    - if NUM_ALGO_ORDERS < MAX_NUM_ALGO_ORDERS
 *      - add 'add-stop-loss-order' task
 *      - increment MAX_NUM_ALGO_ORDERS
 *    - else
 *      - add 'add-sell-market-price-order' task
 * 4. find all OPEN DOWNTREND deals with minProfitPrice > (marketPrice + 0.05%)
 * -  for each deal:
 *    - calculate NUM_ALGO_ORDERS for deal trade pair
 *    - if NUM_ALGO_ORDERS < MAX_NUM_ALGO_ORDERS
 *      - add 'add-take-profit-order' task
 *      - increment MAX_NUM_ALGO_ORDERS
 *    - else
 *      - add 'add-buy-market-price-order' task
 *
 */

const async = require('async');
const debug = require('debug')('bnb:workers:add-stop-loss-orders');
const errorHandler = require('../helpers/error-handler');
const dbHelpers = require('../helpers/db');
const binanceHelpers = require('../helpers/binance');

const Queue = require('bull');
const addStopLossOrderQueue = new Queue('add-stop-loss-order', 'redis://redis:6379');
const addTakeProfitOrderQueue = new Queue('add-take-profit-order', 'redis://redis:6379');
const addSellMarketPriceOrderQueue = new Queue('add-sell-market-price-order', 'redis://redis:6379');
const addBuyMarketPriceOrderQueue = new Queue('add-buy-market-price-order', 'redis://redis:6379');

/**
 * 1. find all active symbols
 * 2. get market price for each symbol
 * 3. find all new profit deals
 * 4. add STOP_LOSS orders
 */
async function worker() {

    try {

        const symbols = await dbHelpers.getTradingSymbols();
        const exchangeInfoMap = await dbHelpers.getExchangeInfoMap(symbols);
        const symbolsWithMarketPrice = await binanceHelpers.symbolMarketPrice(symbols);


        async.eachSeries(symbolsWithMarketPrice, async ({symbol, marketPrice}) => {

            let price, deals;

            // 1. FIND ALL UPTREND DEALS IN PROFIT

            // subtract 0.05 % from marketPrice to lower the chance the stop loss order will be triggered just after was added
            price = marketPrice - marketPrice * 0.0005;
            deals = await dbHelpers.findNewProfitDeals('UPTREND')(symbol, price);
            await async.eachSeries(deals, async deal => {
                const numOfAlgoOrders = await dbHelpers.getNumberOfOpenAlgoOrders(deal.clientId, symbol);
                const maxNumAlgoOrders = exchangeInfoMap[symbol].filters.find(f => f.filterType === 'MAX_NUM_ALGO_ORDERS').maxNumAlgoOrders;
                if (numOfAlgoOrders < maxNumAlgoOrders)
                    await addStopLossOrderQueue.add({
                        stopLossPrice: price,
                        deal: deal.toJSON()
                    });
                else
                    await addSellMarketPriceOrderQueue.add({
                        deal: deal.toJSON()
                    });
            });

            // 2. FIND ALL DOWNTREND DEALS IN PROFIT

            // add 0.05 % to marketPrice to lower the chance the stop loss order will be triggered just after was added
            price = marketPrice + marketPrice * 0.0005;
            deals = await dbHelpers.findNewProfitDeals('DOWNTREND')(symbol, price);
            await async.eachSeries(deals, async deal => {
                const numOfAlgoOrders = await dbHelpers.getNumberOfOpenAlgoOrders(deal.clientId, symbol);
                const maxNumAlgoOrders = exchangeInfoMap[symbol].filters.find(f => f.filterType === 'MAX_NUM_ALGO_ORDERS').maxNumAlgoOrders;
                if (numOfAlgoOrders < maxNumAlgoOrders)
                    await addTakeProfitOrderQueue.add({
                        takeProfitPrice: price,
                        deal: deal.toJSON()
                    });
                else
                    await addBuyMarketPriceOrderQueue.add({
                        deal: deal.toJSON()
                    });
            })
        });
    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }
}

module.exports = worker;