const Queue = require('bull');

const initWorkers = () => {
    /**
     * Init trade queue
     * ----------------------------------------------------------------------------
     * Load all active trade pairs and add them to analyze trade-pair-queue
     */
    const initTradeQueue = new Queue('init-trade', 'redis://redis:6379');
    initTradeQueue.process(__dirname + '/init-trade.js');
    initTradeQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });
    /**
     * Analyze trade pair queue
     * ----------------------------------------------------------------------------
     * @todo add description
     */
    const analyzeTradePairQueue = new Queue('analyze-trade-pair', 'redis://redis:6379');
    analyzeTradePairQueue.process(__dirname + '/analyze-trade-pair.js');


    /**
     * Open deal queue
     * ----------------------------------------------------------------------------
     *
     */
    const openDealQueue = new Queue('open-deal', 'redis://redis:6379');
    openDealQueue.process(__dirname + '/open-deal.js');

    /**
     * Check open orders queue
     * ----------------------------------------------------------------------------
     * Runs every minute and checks the status of open (NEW) orders
     */
    const checkOpenOrdersQueue = new Queue('check-open-orders', 'redis://redis:6379');
    checkOpenOrdersQueue.process(__dirname + '/check-open-orders.js');
    checkOpenOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Add STOP_LOSS orders queue
     * ----------------------------------------------------------------------------
     */
    const addStopLossOrdersQueue = new Queue('add-stop-loss-orders', 'redis://redis:6379');
    addStopLossOrdersQueue.process(__dirname + '/add-stop-loss-orders.js');
    addStopLossOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Check STOP_LOSS orders queue
     * ----------------------------------------------------------------------------
     */
    const checkStopLossOrdersQueue = new Queue('check-stop-loss-orders', 'redis://redis:6379');
    checkStopLossOrdersQueue.process(__dirname + '/check-stop-loss-orders.js');
    checkStopLossOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', initWorkers);
    }
};