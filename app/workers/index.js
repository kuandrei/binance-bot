const Queue = require('bull');

const initWorkers = () => {
    /**
     * Start trade queue
     * ----------------------------------------------------------------------------
     * Load all active trade pairs and add them to analyze trade-pair-queue
     */
    const startTradeQueue = new Queue('start-trade', 'redis://redis:6379');
    startTradeQueue.process(__dirname + '/start-trade.js');
    startTradeQueue.add({}, {
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
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', initWorkers);
    }
};