require('chai').should();

const {Deal, Order} = require('../../app/models');
const worker = require('./../../app/workers/check-open-deals');
const binanceHelpers = require('../../app/helpers/binance');
const Queue = require('bull');
const addStopLossOrderQueue = new Queue('add-stop-loss-order', 'redis://redis:6379');

describe('test check-open-deals worker', function () {

    /**
     * Test flow:
     * 1. get current market price for BTCUSDT
     * 2. create UPTREND deal so that the minProfitPrice will be lower than current market price
     * 3. run worker
     * 4. check the add-stop-loss-order task was added to queue
     */
    it('test e2e flow', async function () {


        const marketPrice = await binanceHelpers.symbolMarketPrice('BTCUSDT');
        const openPrice = marketPrice - marketPrice * 0.05;
        const minProfitPrice = marketPrice - marketPrice * 0.01;

        const deal = await Deal.create({
            clientId: 1,
            symbol: 'BTCUSDT',
            type: 'UPTREND',
            buyQty: 0.00206,
            sellQty: 0.002,
            openPrice,
            minProfitPrice,
            status: 'OPEN',
            algorithm: 'MANUAL',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const precision = Math.pow(10, 8);
        const order = await Order.create({
            clientId: deal.clientId,
            binanceOrderId: Date.now(),
            dealId: deal.id,
            symbol: deal.symbol,
            side: 'BUY',
            type: 'LIMIT',
            status: 'FILLED',
            price: deal.minProfitPrice,
            quantity: deal.buyQty,
            credit: Math.round(deal.minProfitPrice * deal.quantity * precision) / precision,
            creditCurrency: 'USDT',
            debit: deal.buyQty,
            debitCurrency: 'BTC'
        });

        // run the worker
        await worker();

        // check the add-stop-loss-order task was added to queue
        await new Promise((resolve) => {
            addStopLossOrderQueue.process(function (job, done) {
                if (job.data.deal.id === deal.id)
                    resolve();

                done();
            });
        });

        await order.destroy();
        await deal.destroy();
    });

});
