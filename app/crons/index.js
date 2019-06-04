const initCronJobs = () => {
    /**
     * Check open orders
     * ----------------------------------------------------------------------------
     * Runs every minute and checks the status of open (active) orders
     */
    let checkOpenOrdersJob = require('./check-open-orders');
    /**
     * Check open deals
     * ----------------------------------------------------------------------------
     * Runs every minute and checks the status of open (active) orders
     */
    // let checkOpenDealsJob = require('./crons/check-open-deals');
    /**
     * Place bid order job
     * ----------------------------------------------------------------------------
     * Runs every minute and buys BTC (if there is enough funds)
     */
    // let placeBidOrderJob = require('./crons/place-bid-order');

    checkOpenOrdersJob.start();
    // checkOpenDealsJob.start();
    // placeBidOrderJob.start();
};

module.exports = (app) => {
    if (process.env.NODE_ENV !== 'test') {
        app.once('started', initCronJobs);
    }
};