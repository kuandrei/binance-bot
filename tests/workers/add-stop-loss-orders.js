require('chai').should();

const {Deal} = require('../../app/models');
const workerFunctions = require('./../../app/workers/add-stop-loss-orders');

describe('Add stop loss worker', function () {

    it('prepareData for BTCUSDT deal', async function () {
        const result = await workerFunctions.prepareData({
            deal: {
                id: 100,
                clientId: 1,
                symbol: 'BTCUSDT',
                openPrice: 8119.00,
                quantity: 0.002,
                minProfitPrice: 8224.541
            },
            symbol: 'BTCUSDT',
            stopLossPrice: 8224.559
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
        result.binanceOrderData.price.should.equal(8224.56);
        result.binanceOrderData.stopPrice.should.equal(8224.56);
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
    });

    it('prepareSellOrderData for BNBBTC deal', async function () {
        const result = await workerFunctions.prepareData({
            deal: {
                id: 100,
                clientId: 1,
                symbol: 'BNBBTC',
                openPrice: 0.00179710,
                quantity: 1,
                minProfitPrice: 0.00182400
            },
            symbol: 'BNBBTC',
            stopLossPrice: 0.00182400
        });
        result.should.contain.keys('binanceOrderData', 'orderData');
        result.should.contain.keys('binanceOrderData', 'orderData');
        result.binanceOrderData.should.contain.keys([
            'symbol',
            'side',
            'type',
            'quantity',
            'price',
            'stopPrice'
        ]);
        result.binanceOrderData.symbol.should.equal('BNBBTC');
        result.binanceOrderData.side.should.equal('SELL');
        result.binanceOrderData.type.should.equal('STOP_LOSS_LIMIT');
        result.binanceOrderData.quantity.should.equal(1);
        result.binanceOrderData.price.should.equal(0.001824);
        result.binanceOrderData.stopPrice.should.equal(0.001824);
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
        result.orderData.dealId.should.equal(100);
        result.orderData.symbol.should.equal('BNBBTC');
        result.orderData.side.should.equal('SELL');
        result.orderData.type.should.equal('STOP_LOSS_LIMIT');
        result.orderData.status.should.equal('NEW');
        result.orderData.price.should.equal(0.001824);
        result.orderData.quantity.should.equal(1);
        result.orderData.credit.should.equal(0.001824);
        result.orderData.creditCurrency.should.equal('BTC');
        result.orderData.debit.should.equal(1);
        result.orderData.debitCurrency.should.equal('BNB');
    });

    it('addStopLossOrder (e2e)', async function () {

        const deal = await Deal.create({
            clientId: 1,
            symbol: 'BTCUSDT',
            openPrice: 7921.17,
            quantity: 0.002,
            minProfitPrice: 8158.80510000,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const results = await workerFunctions.addStopLossOrder({
            deal: deal.toJSON(),
            symbol: 'BTCUSDT',
            stopLossPrice: 8224.559,
            tradePair: {
                id: 123
            }
        });
        results.should.contain.keys('binanceOrder', 'order');

        // clean the database
        await results.order.destroy();
        await deal.destroy();
    });

});
