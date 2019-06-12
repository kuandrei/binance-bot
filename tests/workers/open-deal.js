require('chai').should();

const server = require('../../app/server');
const workerFunctions = require('./../../app/workers/open-deal');

before((done) => {
    if (server.started)
        return done();
    server.once('started', done);
});

describe('Open deal worker', function () {

    it('prepareDealData', async function () {
        const result = workerFunctions.prepareDealData({
            marketPrice: 8224.56,
            tradePair: {
                clientId: 1,
                symbol: 'BTCUSDT',
                dealQty: 0.002,
                additionPercentage: 0.03
            },
            currencyPair: {
                firstCurrencyPrecision: 6,
                secondCurrencyPrecision: 2
            }
        });

        result.should.contain.keys([
            'clientId',
            'symbol',
            'openPrice',
            'quantity',
            'minProfitPrice',
            'status'
        ]);
        result.clientId.should.equal(1);
        result.symbol.should.equal('BTCUSDT');
        result.openPrice.should.equal(8224.56);
        result.quantity.should.equal(0.002);
        result.minProfitPrice.should.equal(8471.30);
        result.status.should.equal('NEW');
    });

    it('prepareBinanceOrderData', async function () {
        const result = workerFunctions.prepareBinanceOrderData({
            marketPrice: 8224.56,
            tradePair: {
                symbol: 'BTCUSDT',
                dealQty: 0.002,
                additionPercentage: 0.03
            }

        });
        result.should.contain.keys([
            'symbol',
            'side',
            'type',
            'quantity',
            'price'
        ]);
        result.symbol.should.equal('BTCUSDT');
        result.side.should.equal('BUY');
        result.type.should.equal('LIMIT');
        result.quantity.should.equal(0.002 + 0.002 * 0.03);
        result.price.should.equal(8224.56);
    });

    it('prepareOrderData', async function () {
        const result = workerFunctions.prepareOrderData({
            client: {
                id: 1,
                commission: 0.00075
            },
            marketPrice: 8224.56,
            currencyPair: {
                symbol: 'BTCUSDT',
                firstCurrency: 'BTC',
                secondCurrency: 'USDT'
            },
            binanceOrder: {
                price: 8224.56,
                quantity: 0.00206
            }
        });
        result.should.contain.keys([
            'clientId',
            'symbol',
            'side',
            'type',
            'status',
            'price',
            'quantity',
            'fee',
            'feeCurrency',
            'credit',
            'feeCurrency',
            'debit',
            'debitCurrency',
        ]);
        const precision = Math.pow(10, 8);
        result.clientId.should.equal(1);
        result.symbol.should.equal('BTCUSDT');
        result.side.should.equal('BUY');
        result.type.should.equal('LIMIT');
        result.status.should.equal('NEW');
        result.price.should.equal(8224.56);
        result.quantity.should.equal(0.00206);
        result.fee.should.equal(Math.round(0.00206 * 0.00075 * precision) / precision);
        result.feeCurrency.should.equal('BTC');
        result.credit.should.equal(0.00206);
        result.creditCurrency.should.equal('BTC');
        result.debit.should.equal(Math.round(8224.56 * 0.00206 * precision) / precision);
        result.debitCurrency.should.equal('USDT');
    });

});