require('chai').should();

const server = require('../../app/server');
const workerFunctions = require('./../../app/workers/add-stop-loss-orders');

before((done) => {
    if (server.started)
        return done();
    server.once('started', done);
});

describe('Add stop loss worker', function () {

    it('getSymbolsWithMarketPrice', async function () {
        const results = await workerFunctions.getSymbolsWithMarketPrice(['BTCUSDT', 'BNBUSDT', 'BNBBTC']);
        results.length.should.be.equal(3);
        results[0].should.contain.keys('symbol', 'marketPrice');

    });

    it('prepareSellOrderData for BTCUSDT deal', async function () {
        const result = await workerFunctions.prepareSellOrderData({
            deal: {
                id: 100,
                clientId: 1,
                symbol: 'BTCUSDT',
                openPrice: 8119.00,
                quantity: 0.002,
                minProfitPrice: 8224.541
            },
            symbol: 'BTCUSDT',
            marketPrice: 8224.559
        });

        result.should.contain.keys('placeOrderData', 'orderCreationData');
        result.placeOrderData.should.contain.keys([
            'symbol',
            'side',
            'type',
            'quantity',
            'price',
            'stopPrice'
        ]);
        result.placeOrderData.symbol.should.equal('BTCUSDT');
        result.placeOrderData.side.should.equal('SELL');
        result.placeOrderData.type.should.equal('STOP_LOSS_LIMIT');
        result.placeOrderData.quantity.should.equal(0.002);
        result.placeOrderData.price.should.equal(8224.55);
        result.placeOrderData.stopPrice.should.equal(8224.55);
        result.orderCreationData.should.contain.keys([
            'clientId',
            'dealId',
            'symbol',
            'side',
            'type',
            'status',
            'price',
            'quantity',
            'fee',
            'feeCurrency',
            'credit',
            'creditCurrency',
            'debit',
            'debitCurrency'
        ]);
    });

    it('prepareSellOrderData for BNBBTC deal', async function () {
        const result = await workerFunctions.prepareSellOrderData({
            deal: {
                id: 100,
                clientId: 1,
                symbol: 'BNBBTC',
                openPrice: 0.00179710,
                quantity: 1,
                minProfitPrice: 0.00182400
            },
            symbol: 'BNBBTC',
            marketPrice: 0.00182400
        });
        result.should.contain.keys('placeOrderData', 'orderCreationData');
        result.should.contain.keys('placeOrderData', 'orderCreationData');
        result.placeOrderData.should.contain.keys([
            'symbol',
            'side',
            'type',
            'quantity',
            'price',
            'stopPrice'
        ]);
        result.placeOrderData.symbol.should.equal('BNBBTC');
        result.placeOrderData.side.should.equal('SELL');
        result.placeOrderData.type.should.equal('STOP_LOSS_LIMIT');
        result.placeOrderData.quantity.should.equal(1);
        result.placeOrderData.price.should.equal(0.001824);
        result.placeOrderData.stopPrice.should.equal(0.001824);
        result.orderCreationData.should.contain.keys([
            'clientId',
            'dealId',
            'symbol',
            'side',
            'type',
            'status',
            'price',
            'quantity',
            'fee',
            'feeCurrency',
            'credit',
            'creditCurrency',
            'debit',
            'debitCurrency'
        ]);
        result.orderCreationData.clientId.should.equal(1);
        result.orderCreationData.dealId.should.equal(100);
        result.orderCreationData.symbol.should.equal('BNBBTC');
        result.orderCreationData.side.should.equal('SELL');
        result.orderCreationData.type.should.equal('STOP_LOSS_LIMIT');
        result.orderCreationData.status.should.equal('NEW');
        result.orderCreationData.price.should.equal(0.001824);
        result.orderCreationData.quantity.should.equal(1);
        result.orderCreationData.fee.should.equal(0.00000137);
        result.orderCreationData.feeCurrency.should.equal('BTC');
        result.orderCreationData.credit.should.equal(0.001824);
        result.orderCreationData.creditCurrency.should.equal('BTC');
        result.orderCreationData.debit.should.equal(1);
        result.orderCreationData.debitCurrency.should.equal('BNB');
    });

});
