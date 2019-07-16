/**
 * @see docs/workers.md
 */
const Queue = require('bull');

const init = () => {

    /**
     * Adds analyze-trade-pair task for every active/trading trade pair
     */
    const addTradePairsForAnalysisQueue = new Queue('add-trade-pairs-for-analysis', 'redis://redis:6379');
    addTradePairsForAnalysisQueue.process(1, __dirname + '/add-trade-pairs-for-analysis.js');
    /**
     * Checks if the new deal should be opened for given trade pair
     */
    const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
    analyzeTradePairQueue.process(3, __dirname + '/analyze-trade-pair.js');
    /**
     *  Opens new deal for given trade pair. Sets new buy/sell order (depends on deal type)
     */
    const openNewDealQueue = new Queue('open-new-deal', 'redis://redis:6379');
    openNewDealQueue.process(3, __dirname + '/open-new-deal.js');
    /**
     * Monitors status of open deals, if become profitable - adds appropriate task
     */
    const checkOpenDealsQueue = new Queue('check-open-deals', 'redis://redis:6379');
    checkOpenDealsQueue.process(1, __dirname + '/check-open-deals.js');
    /**
     * Adds stop loss order for given deal (only for uptrend deals)
     */
    const addStopLossOrderQueue = new Queue('add-stop-loss-order', 'redis://redis:6379');
    addStopLossOrderQueue.process(3, __dirname + '/add-stop-loss-order.js');
    /**
     * Adds take profit order for given deal (only for downtrend deals)
     */
    const addTakeProfitOrderQueue = new Queue('add-take-profit-order', 'redis://redis:6379');
    addTakeProfitOrderQueue.process(3, __dirname + '/add-take-profit-order.js');
    /**
     * Checks the status of open (NEW) orders
     */
    const checkOpenOrdersQueue = new Queue('check-open-orders', 'redis://redis:6379');
    checkOpenOrdersQueue.process(1, __dirname + '/check-open-orders.js');
    /**
     * Replaces stop loss order with new one (higher price)
     */
    const replaceStopLossOrderQueue = new Queue('replace-stop-loss-order', 'redis://redis:6379');
    replaceStopLossOrderQueue.process(3, __dirname + '/replace-stop-loss-order.js');

    /**
     * Replaces take profit order with new one (lower price)
     */
    const replaceTakeProfitOrderQueue = new Queue('replace-take-profit-order', 'redis://redis:6379');
    replaceTakeProfitOrderQueue.process(3, __dirname + '/replace-take-profit-order.js');

    /**
     * Adds prepare-symbol-info task for every active/trading symbol
     */
    const addSymbolsForAnalysisQueue = new Queue('add-symbols-for-analysis', 'redis://redis:6379');
    addSymbolsForAnalysisQueue.process(1, __dirname + '/add-symbols-for-analysis.js');
    /**
     * Prepares symbol info (market price, technical indicators etc)
     */
    const prepareSymbolInfoQueue = new Queue('prepare-symbol-info', 'redis://redis:6379');
    prepareSymbolInfoQueue.process(3, __dirname + '/prepare-symbol-info.js');
    /**
     * Updates data in ExchangeInfo table with data loaded from https://www.binance.com/api/v1/exchangeInfo
     */
    const updateExchangeInfoQueue = new Queue('update-exchange-info', 'redis://redis:6379');
    updateExchangeInfoQueue.process(1, __dirname + '/update-exchange-info.js');
    /**
     * System garbage collector
     */
    const maintenanceQueue = new Queue('maintenance', 'redis://redis:6379');
    maintenanceQueue.process(1, __dirname + '/maintenance.js');
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', init);
    }
};