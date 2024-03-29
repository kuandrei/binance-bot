require('chai').should();

const {Deal} = require('../../app/models');
const workerFunctions = require('../../app/workers/add-stop-loss-order');

describe('test add stop loss order worker', function () {

    describe('test uptrend use cases', function () {

        it('test prepareData function for BTCUSDT - should return binanceOrderData and orderData', async function () {
            const deal = {
                id: 100,
                clientId: 1,
                type: 'UPTREND',
                symbol: 'BTCUSDT',
                openPrice: 8119.00,
                sellQty: 0.002,
                minProfitPrice: 8224.541
            };
            const result = await workerFunctions.prepareData({
                deal,
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
            result.orderData.clientId.should.equal(deal.clientId);
            result.orderData.dealId.should.equal(deal.id);
            result.orderData.symbol.should.equal(deal.symbol);
            result.orderData.side.should.equal('SELL');
            result.orderData.type.should.equal('STOP_LOSS_LIMIT');
            result.orderData.status.should.equal('NEW');
            result.orderData.price.should.equal(8224.56);
            result.orderData.quantity.should.equal(0.002);
            result.orderData.credit.should.equal(16.44912);
            result.orderData.creditCurrency.should.equal('USDT');
            result.orderData.debit.should.equal(0.002);
            result.orderData.debitCurrency.should.equal('BTC');
        });

        it('test prepareData function for BNBBTC - should return binanceOrderData and orderData', async function () {
            const deal = {
                id: 100,
                clientId: 1,
                type: 'UPTREND',
                symbol: 'BNBBTC',
                openPrice: 0.00179710,
                sellQty: 1,
                minProfitPrice: 0.00182400
            };
            const result = await workerFunctions.prepareData({
                deal,
                stopLossPrice: 0.00182400
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

        it('test e2e flow - should return created order', async function () {

            const deal = await Deal.create({
                clientId: 1,
                symbol: 'BTCUSDT',
                type: 'UPTREND',
                buyQty: 0.00206,
                sellQty: 0.002,
                openPrice: 7921.17,
                minProfitPrice: 8158.80510000,
                status: 'OPEN',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const results = await workerFunctions.addStopLossOrder({
                data: {
                    deal: deal.toJSON(),
                    stopLossPrice: 8224.559
                }
            });
            results.should.contain.keys('binanceOrder', 'order');

            // clean the database
            await results.order.destroy();
            await deal.destroy();
        });

    });

    describe('test downtrend use cases', function () {

        it('test prepareData function for BTCUSDT - should return binanceOrderData and orderData', async function () {
            const deal = {
                id: 100,
                clientId: 1,
                type: 'DOWNTREND',
                symbol: 'BTCUSDT',
                openPrice: 11458.50,
                buyQty: 0.00502500,
                sellQty: 0.005,
                minProfitPrice: 11401.50
            };
            const result = await workerFunctions.prepareData({
                deal,
                stopLossPrice: 11397.25
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
            result.binanceOrderData.side.should.equal('BUY');
            result.binanceOrderData.type.should.equal('STOP_LOSS_LIMIT');
            result.binanceOrderData.quantity.should.equal(0.00502500);
            result.binanceOrderData.price.should.equal(11397.25);
            result.binanceOrderData.stopPrice.should.equal(11397.25);
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
            result.orderData.clientId.should.equal(deal.clientId);
            result.orderData.dealId.should.equal(deal.id);
            result.orderData.symbol.should.equal(deal.symbol);
            result.orderData.side.should.equal('BUY');
            result.orderData.type.should.equal('STOP_LOSS_LIMIT');
            result.orderData.status.should.equal('NEW');
            result.orderData.price.should.equal(11397.25);
            result.orderData.quantity.should.equal(0.005025);
            result.orderData.credit.should.equal(0.005025);
            result.orderData.creditCurrency.should.equal('BTC');
            result.orderData.debit.should.equal(57.27118125);
            result.orderData.debitCurrency.should.equal('USDT');
        });

        it('test prepareData function for BNBBTC - should return binanceOrderData and orderData', async function () {
            const deal = {
                id: 100,
                clientId: 1,
                type: 'DOWNTREND',
                symbol: 'BNBBTC',
                openPrice: 0.00362700,
                sellQty: 2,
                buyQty: 2,
                minProfitPrice: 0.00360886
            };
            const result = await workerFunctions.prepareData({
                deal,
                stopLossPrice: 0.00360810
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
            result.binanceOrderData.symbol.should.equal('BNBBTC');
            result.binanceOrderData.side.should.equal('BUY');
            result.binanceOrderData.type.should.equal('STOP_LOSS_LIMIT');
            result.binanceOrderData.quantity.should.equal(2);
            result.binanceOrderData.price.should.equal(0.00360810);
            result.binanceOrderData.stopPrice.should.equal(0.00360810);
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
            result.orderData.side.should.equal('BUY');
            result.orderData.type.should.equal('STOP_LOSS_LIMIT');
            result.orderData.status.should.equal('NEW');
            result.orderData.price.should.equal(0.00360810);
            result.orderData.quantity.should.equal(2);
            result.orderData.credit.should.equal(2);
            result.orderData.creditCurrency.should.equal('BNB');
            result.orderData.debit.should.equal(0.0072162);
            result.orderData.debitCurrency.should.equal('BTC');
        });

        it('test e2e flow - should return created order', async function () {

            const deal = await Deal.create({
                clientId: 1,
                type: 'DOWNTREND',
                symbol: 'BTCUSDT',
                openPrice: 11458.50,
                buyQty: 0.00502500,
                sellQty: 0.005,
                minProfitPrice: 11401.50,
                status: 'OPEN',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const results = await workerFunctions.addStopLossOrder({
                data: {
                    deal: deal.toJSON(),
                    stopLossPrice: 11397.25
                }
            });
            results.should.contain.keys('binanceOrder', 'order');

            // clean the database
            await results.order.destroy();
            await deal.destroy();
        });

    });

});
