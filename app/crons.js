const Queue = require('bull');

const init = () => {
    /**
     * Update exchange info cron - should run once a day at 2:00 AM
     */
    const updateExchangeInfoQueue = new Queue('update-exchange-info', 'redis://redis:6379');
    updateExchangeInfoQueue.add({}, {
        repeat: {
            cron: '0 2 * * *'
        },
        removeOnComplete: true
    });
    /**
     * Init trade queue - should run once a minute
     */
    const initTradeQueue = new Queue('init-trade', 'redis://redis:6379');
    initTradeQueue.add({}, {
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

    /**
     * Add STOP_LOSS orders queue - should run once a minute
     */
    const addStopLossOrdersQueue = new Queue('add-stop-loss-orders', 'redis://redis:6379');
    addStopLossOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });

    /**
     * Check STOP_LOSS orders queue - should run once a minute
     */
    const checkStopLossOrdersQueue = new Queue('check-stop-loss-orders', 'redis://redis:6379');
    checkStopLossOrdersQueue.add({}, {
        repeat: {
            cron: '* * * * *'
        },
        removeOnComplete: true
    });
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', init);
    }
};