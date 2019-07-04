require('chai').should();

const {Deal, Order} = require('../../app/models');
const worker = require('./../../app/workers/check-open-orders');
const binanceHelper = require('./../../app/helpers/binance');

const Queue = require('bull');
const replaceStopLossOrderQueue = new Queue('replace-stop-loss-order', 'redis://redis:6379');

describe('test check-open-orders worker', function () {

    it('test order status changes from open to filled', async function () {

        let order = await Order.findOne({
            where: {
                symbol: 'BTCUSDT',
                status: 'FILLED'
            }
        });

        order.status = 'NEW';
        await order.save();

        await worker();

        order = await Order.findByPk(order.id);
        order.status.should.equal('FILLED');
    });

    it('test replace order task added', async function () {

        const marketPrice = await binanceHelper.symbolMarketPrice('BTCUSDT');
        const openPrice = marketPrice - marketPrice * 0.1;
        const minProfitPrice = marketPrice - marketPrice * 0.005;

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
        const openOrder = await Order.create({
            clientId: deal.clientId,
            binanceOrderId: Date.now(),
            dealId: deal.id,
            symbol: deal.symbol,
            side: 'BUY',
            type: 'LIMIT',
            status: 'FILLED',
            price: deal.minProfitPrice,
            quantity: deal.buyQty,
            credit: Math.round(deal.minProfitPrice * deal.buyQty * precision) / precision,
            creditCurrency: 'USDT',
            debit: deal.buyQty,
            debitCurrency: 'BTC'
        });
        const stopLossOrder = await Order.create({
            clientId: deal.clientId,
            binanceOrderId: Date.now(),
            dealId: deal.id,
            symbol: deal.symbol,
            side: 'SELL',
            type: 'STOP_LOSS_LIMIT',
            status: 'NEW',
            price: deal.minProfitPrice,
            quantity: deal.sellQty,
            credit: deal.sellQty,
            creditCurrency: 'BTC',
            debit: Math.round(deal.minProfitPrice * deal.quantity * precision) / precision,
            debitCurrency: 'USDT'
        });

        // run the worker
        await worker();

        // check the replace stop limit order task added to queue
        await new Promise((resolve) => {
            replaceStopLossOrderQueue.process(function (job, done) {
                if (job.data.order.id === stopLossOrder.id)
                    resolve();

                done();
            });
        });

        await openOrder.destroy();
        await stopLossOrder.destroy();
        await deal.destroy();
    });

});
