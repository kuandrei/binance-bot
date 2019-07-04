/**
 * @see docs/workers.md
 */
const Queue = require('bull');

const init = () => {

    /**
     * Adds analyze-trade-pair task for every active/trading trade pair
     */
    const addTradePairsForAnalysisQueue = new Queue('add-trade-pairs-for-analysis', 'redis://redis:6379');
    addTradePairsForAnalysisQueue.process(__dirname + '/add-trade-pairs-for-analysis.js');
    /**
     * Checks if the new deal should be opened for given trade pair
     */
    const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
    analyzeTradePairQueue.process(__dirname + '/analyze-trade-pair.js');
    /**
     *  Opens new deal for given trade pair. Sets new buy/sell order (depends on deal type)
     */
    const openNewDealQueue = new Queue('open-new-deal', 'redis://redis:6379');
    openNewDealQueue.process(__dirname + '/open-new-deal.js');
    /**
     * Checks the status of open (NEW) orders
     */
    const checkOpenOrdersQueue = new Queue('check-open-orders', 'redis://redis:6379');
    checkOpenOrdersQueue.process(__dirname + '/check-open-orders.js');
    /**
     * Adds stop loss order for given deal (only for uptrend deals)
     */
    const addStopLossOrderQueue = new Queue('add-stop-loss-order', 'redis://redis:6379');
    addStopLossOrderQueue.process(__dirname + '/add-stop-loss-order.js');

    // /**
    //  * @todo add description
    //  */
    // const checkStopLossOrdersQueue = new Queue('check-stop-loss-orders', 'redis://redis:6379');
    // checkStopLossOrdersQueue.process(__dirname + '/check-stop-loss-orders.js');

    /**
     * Adds prepare-symbol-info task for every active/trading symbol
     */
    const addSymbolsForAnalysisQueue = new Queue('add-symbols-for-analysis', 'redis://redis:6379');
    addSymbolsForAnalysisQueue.process(__dirname + '/add-symbols-for-analysis.js');
    /**
     * Prepares symbol info (market price, technical indicators etc)
     */
    const prepareSymbolInfoQueue = new Queue('prepare-symbol-info', 'redis://redis:6379');
    prepareSymbolInfoQueue.process(__dirname + '/prepare-symbol-info.js');
    /**
     * Updates data in ExchangeInfo table with data loaded from https://www.binance.com/api/v1/exchangeInfo
     */
    const updateExchangeInfoQueue = new Queue('update-exchange-info', 'redis://redis:6379');
    updateExchangeInfoQueue.process(__dirname + '/update-exchange-info.js');
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', init);
    }
};