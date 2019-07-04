require('chai').should();

const {Deal, Order} = require('../../app/models');
const workerFunctions = require('./../../app/workers/check-stop-loss-orders');

describe.skip('Check stop loss worker', function () {

    it('placeNewStopLossOrder', async function () {
        const maxPrecision = Math.pow(10, 8);
        const deal = await Deal.create({
            clientId: 1,
            symbol: 'BTCUSDT',
            openPrice: 7921.17,
            quantity: 0.002,
            minProfitPrice: 8158.80,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const order = await Order.create({
            clientId: deal.clientId,
            binanceOrderId: Date.now(),
            dealId: deal.id,
            symbol: deal.symbol,
            side: 'SELL',
            type: 'STOP_LOSS_LIMIT',
            status: 'NEW',
            price: deal.minProfitPrice,
            quantity: deal.quantity,
            credit: Math.round(deal.minProfitPrice * deal.quantity * maxPrecision) / maxPrecision,
            creditCurrency: 'USDT',
            debit: deal.quantity,
            debitCurrency: 'BTC'
        });

        const results = await workerFunctions.placeNewStopLossOrder({
            order,
            stopLossPrice: 8224.56
        });
        results.should.contain.keys('binanceOrder', 'order');

        // clean the database
        await results.order.destroy();
        await order.destroy();
        await results.order.destroy();
        await deal.destroy();
    });

    it('prepareData for BTCUSDT deal', async function () {
        const result = await workerFunctions.prepareData({
            order: {
                id: 100,
                dealId: 501,
                clientId: 1,
                symbol: 'BTCUSDT',
                price: 8175.21,
                quantity: 0.002,
                binanceOrderId: 12345
            },
            stopLossPrice: 8224.55
        });

        result.should.contain.keys('binanceOrderData', 'orderData');
        result.binanceOrderData.should.contain.keys([
            'symbol',
            'side',
            'type',
            'quantity',
            'price',
            'stopPrice'
        ]);
        result.binanceOrderData.symbol.should.equal('BTCUSDT');
        result.binanceOrderData.side.should.equal('SELL');
        result.binanceOrderData.type.should.equal('STOP_LOSS_LIMIT');
        result.binanceOrderData.quantity.should.equal(0.002);
        result.binanceOrderData.price.should.equal(8224.55);
        result.binanceOrderData.stopPrice.should.equal(8224.55);
        result.orderData.should.contain.keys([
            'clientId',
            'dealId',
            'symbol',
            'side',
            'type',
            'status',
            'price',
            'quantity',
            'credit',
            'creditCurrency',
            'debit',
            'debitCurrency'
        ]);
        result.orderData.clientId.should.equal(1);
        result.orderData.dealId.should.equal(501);
        result.orderData.quantity.should.equal(0.002);
    });


});
