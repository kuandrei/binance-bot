const Queue = require('bull');

const init = () => {

    /**
     * Adds analyze-trade-pair task for every active/trading trade pair
     */
    const addTradePairsForAnalysisQueue = new Queue('add-trade-pairs-for-analysis', 'redis://redis:6379');
    addTradePairsForAnalysisQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Check open deals queue
     */
    const checkOpenDealsQueue = new Queue('check-open-deals', 'redis://redis:6379');
    checkOpenDealsQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Check open orders queue
     */
    const checkOpenOrdersQueue = new Queue('check-open-orders', 'redis://redis:6379');
    checkOpenOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Adds prepare-symbol-info task for every active/trading symbol
     */
    const addSymbolsForAnalysisQueue = new Queue('add-symbols-for-analysis', 'redis://redis:6379');
    addSymbolsForAnalysisQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Update exchange info cron
     */
    const updateExchangeInfoQueue = new Queue('update-exchange-info', 'redis://redis:6379');
    updateExchangeInfoQueue.add({}, {
        repeat: {
            cron: '0 2 * * *'
        },
        removeOnComplete: true
    });

    /**
     * System maintenance cron
     */
    const maintenanceQueue = new Queue('maintenance', 'redis://redis:6379');
    maintenanceQueue.add({}, {
        repeat: {
            cron: '0 3 * * *'
        },
        removeOnComplete: true
    });
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', init);
    }
};