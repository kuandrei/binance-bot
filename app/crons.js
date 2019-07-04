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
     * Check open orders queue - should run once a minute
     */
    const checkOpenOrdersQueue = new Queue('check-open-orders', 'redis://redis:6379');
    checkOpenOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });
    //
    // /**
    //  * Add STOP_LOSS orders queue - should run once a minute
    //  */
    // const addStopLossOrdersQueue = new Queue('add-stop-loss-orders', 'redis://redis:6379');
    // addStopLossOrdersQueue.add({}, {
    //     repeat: {
    //         cron: '* * * * *'
    //     },
    //     removeOnComplete: true
    // });
    //
    // /**
    //  * Check STOP_LOSS orders queue - should run once a minute
    //  */
    // const checkStopLossOrdersQueue = new Queue('check-stop-loss-orders', 'redis://redis:6379');
    // checkStopLossOrdersQueue.add({}, {
    //     repeat: {
    //         cron: '* * * * *'
    //     },
    //     removeOnComplete: true
    // });

    /**
     * Update exchange info cron - runs once a day at 2:00 AM
     */
    const updateExchangeInfoQueue = new Queue('update-exchange-info', 'redis://redis:6379');
    updateExchangeInfoQueue.add({}, {
        repeat: {
            cron: '0 2 * * *'
        },
        removeOnComplete: true
    });

    /**
     * System maintenance cron - runs once a day at 3:00 AM
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