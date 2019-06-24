require('chai').should();

const {ExchangeInfo} = require('../../app/models');
const workerFunctions = require('./../../app/workers/open-new-deal');

describe.skip('Open deal worker', function () {

    it('prepareDealData', async function () {
        const exchangeInfo = await ExchangeInfo.findOne({where: {symbol: 'BNBUSDT'}});
        const result = workerFunctions.prepareDealData({
            marketPrice: 37.5147,
            tradePair: {
                clientId: 1,
                symbol: 'BNBUSDT',
                dealQty: 2,
                minProfitRate: 0.003,
                profitOn: 'BASE_ASSET'
            },
            exchangeInfo,
            algorithm: 'MACD-SLC(5m)'
        });

        result.should.contain.keys([
            'clientId',
            'symbol',
            'buyQty',
            'sellQty',
            'minProfitPrice',
            'status',
            'algorithm'
        ]);
        result.clientId.should.equal(1);
        result.symbol.should.equal('BNBUSDT');
        result.buyQty.should.equal(2.01);
        result.sellQty.should.equal(2);
        result.openPrice.should.equal(37.5147);
        result.minProfitPrice.should.equal(37.70225);
        result.status.should.equal('NEW');
        result.algorithm.should.equal('MACD-SLC(5m)');
    });

    it.skip('prepareBinanceOrderData', async function () {
        const result = workerFunctions.prepareBinanceOrderData({
            marketPrice: 8224.56,
            tradePair: {
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

    it.skip('prepareOrderData', async function () {
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

    it.skip('openDeal', async function () {
        const results = await workerFunctions.openDeal({
            data: {
                clientId: 1,
                client: {
                    id: 1,
                    commission: 0.00075
                },
                marketPrice: 8224.56,
                tradePair: {
                    id: 1,
                    clientId: 1,
                    symbol: 'BTCUSDT',
                    dealQty: 0.002,
                    additionPercentage: 0.03
                },
                currencyPair: {
                    symbol: 'BTCUSDT',
                    firstCurrency: 'BTC',
                    secondCurrency: 'USDT',
                    firstCurrencyPrecision: 6,
                    secondCurrencyPrecision: 2
                },
                balances: {
                    'USDT': 10000
                }
            }
        });

        results.should.contain.keys('binanceOrder', 'order', 'deal');

        // clean the database
        await results.order.destroy();
        await results.deal.destroy();

    });

});
