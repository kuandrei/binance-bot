const Queue = require('bull');

const init = () => {
    /**
     * Updates data in ExchangeInfo table with data loaded from https://www.binance.com/api/v1/exchangeInfo
     */
    const updateExchangeInfoQueue = new Queue('update-exchange-info', 'redis://redis:6379');
    updateExchangeInfoQueue.process(__dirname + '/update-exchange-info.js');
    /**
     * Load all active trade pairs and add them to analyze trade-pair-queue
     */
    const initTradeQueue = new Queue('init-trade', 'redis://redis:6379');
    initTradeQueue.process(__dirname + '/init-trade.js');
    /**
     * @todo add description
     */
    const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
    analyzeTradePairQueue.process(__dirname + '/analyze-trade-pair.js');
    /**
     * @todo add description
     */
    const openDealQueue = new Queue('open-deal', 'redis://redis:6379');
    openDealQueue.process(__dirname + '/open-deal.js');
    /**
     * Checks the status of open (NEW) orders
     */
    const checkOpenOrdersQueue = new Queue('check-open-orders', 'redis://redis:6379');
    checkOpenOrdersQueue.process(__dirname + '/check-open-orders.js');
    /**
     * @todo add description
     */
    const addStopLossOrdersQueue = new Queue('add-stop-loss-orders', 'redis://redis:6379');
    addStopLossOrdersQueue.process(__dirname + '/add-stop-loss-orders.js');

    /**
     * @todo add description
     */
    const checkStopLossOrdersQueue = new Queue('check-stop-loss-orders', 'redis://redis:6379');
    checkStopLossOrdersQueue.process(__dirname + '/check-stop-loss-orders.js');
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', init);
    }
};