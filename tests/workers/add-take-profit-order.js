require('chai').should();

const {Deal} = require('../../app/models');
const workerFunctions = require('../../app/workers/add-take-profit-order');

describe('test add take profit order worker', function () {

    it('test prepareData function for BNBUSDT - should return binanceOrderData and orderData', async function () {
        const deal = {
            id: 100,
            clientId: 1,
            symbol: 'BNBUSDT',
            type: 'DOWNTREND',
            buyQty: 2,
            sellQty: 2,
            openPrice: 37.5147,
            minProfitPrice: 37.4025
        };
        const result = await workerFunctions.prepareData({
            deal,
            takeProfitPrice: 37.2011
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
        result.binanceOrderData.symbol.should.equal('BNBUSDT');
        result.binanceOrderData.side.should.equal('BUY');
        result.binanceOrderData.type.should.equal('TAKE_PROFIT_LIMIT');
        result.binanceOrderData.quantity.should.equal(2);
        result.binanceOrderData.price.should.equal(37.2011);
        result.binanceOrderData.stopPrice.should.equal(37.2011);
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
        result.orderData.symbol.should.equal('BNBUSDT');
        result.orderData.side.should.equal('BUY');
        result.orderData.type.should.equal('TAKE_PROFIT_LIMIT');
        result.orderData.status.should.equal('NEW');
        result.orderData.price.should.equal(37.2011);
        result.orderData.quantity.should.equal(2);
        result.orderData.credit.should.equal(2);
        result.orderData.creditCurrency.should.equal('BNB');
        result.orderData.debit.should.equal(37.2011 * 2);
        result.orderData.debitCurrency.should.equal('USDT');
    });

    it('test e2e flow - should return created order', async function () {

        const deal = await Deal.create({
            clientId: 1,
            symbol: 'BNBUSDT',
            type: 'DOWNTREND',
            buyQty: 2,
            sellQty: 2,
            openPrice: 37.5147,
            minProfitPrice: 37.4025,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const results = await workerFunctions.addTakeProfitOrder({
            deal: deal.toJSON(),
            takeProfitPrice: 37.2011
        });
        results.should.contain.keys('binanceOrder', 'order');

        // clean the database
        await results.order.destroy();
        await deal.destroy();
    });

});
