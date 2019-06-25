require('chai').should();

const {ExchangeInfo} = require('../../app/models');
const workerFunctions = require('./../../app/workers/open-new-deal');

describe.only('Open new deal worker', function () {

    it('prepareDealData (BNBUSDT/BASE_ASSET/dealQty:2/minProfitRate:0.3%)', async function () {
        const exchangeInfo = await ExchangeInfo.findOne({where: {symbol: 'BNBUSDT'}});
        const result = workerFunctions.prepareDealData({
            marketPrice: 37.5147,
            tradePair: {
                clientId: 1,
                symbol: 'BNBUSDT',
                dealQty: 2,
                minProfitRate: 0.003,
                profitIn: 'BASE_ASSET'
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
        result.minProfitPrice.should.equal(37.7023);
        result.status.should.equal('NEW');
        result.algorithm.should.equal('MACD-SLC(5m)');
    });

    it('prepareDealData (BTCUSDT/BASE_ASSET/dealQty:0.01/minProfitRate:0.5%)', async function () {
        const exchangeInfo = await ExchangeInfo.findOne({where: {symbol: 'BTCUSDT'}});
        const result = workerFunctions.prepareDealData({
            marketPrice: 10986.82,
            tradePair: {
                clientId: 1,
                symbol: 'BTCUSDT',
                dealQty: 0.01,
                minProfitRate: 0.005,
                profitIn: 'BASE_ASSET'
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
        result.symbol.should.equal('BTCUSDT');
        result.buyQty.should.equal(0.01005);
        result.sellQty.should.equal(0.01);
        result.openPrice.should.equal(10986.82);
        result.minProfitPrice.should.equal(11041.76);
        result.status.should.equal('NEW');
        result.algorithm.should.equal('MACD-SLC(5m)');
    });

    it('prepareDealData (BNBUSDT/QUOTE_ASSET/dealQty:2/minProfitRate:0.3%)', async function () {
        const exchangeInfo = await ExchangeInfo.findOne({where: {symbol: 'BNBUSDT'}});
        const result = workerFunctions.prepareDealData({
            marketPrice: 37.5147,
            tradePair: {
                clientId: 1,
                symbol: 'BNBUSDT',
                dealQty: 2,
                minProfitRate: 0.003,
                profitIn: 'QUOTE_ASSET'
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
        result.buyQty.should.equal(2);
        result.sellQty.should.equal(2);
        result.openPrice.should.equal(37.5147);
        result.minProfitPrice.should.equal(37.6273);
        result.status.should.equal('NEW');
        result.algorithm.should.equal('MACD-SLC(5m)');
    });

    it('prepareBinanceOrderData (BNBUSDT/BASE_ASSET/dealQty:2/minProfitRate:0.3%)', async function () {
        // from first test
        const exchangeInfo = await ExchangeInfo.findOne({where: {symbol: 'BNBUSDT'}});
        const deal = workerFunctions.prepareDealData({
            marketPrice: 37.5147,
            tradePair: {
                clientId: 1,
                symbol: 'BNBUSDT',
                dealQty: 2,
                minProfitRate: 0.003,
                profitIn: 'BASE_ASSET'
            },
            exchangeInfo,
            algorithm: 'MACD-SLC(5m)'
        });
        const result = workerFunctions.prepareBinanceOrderData({deal});
        result.should.contain.keys([
            'symbol',
            'side',
            'type',
            'quantity',
            'price'
        ]);
        result.symbol.should.equal('BNBUSDT');
        result.side.should.equal('BUY');
        result.type.should.equal('LIMIT');
        result.quantity.should.equal(2.01);
        result.price.should.equal(37.5147);
    });

    it('prepareOrderData (BTCUSDT/BASE_ASSET/dealQty:0.01/minProfitRate:0.5%)', async function () {
        // from second test
        const exchangeInfo = await ExchangeInfo.findOne({where: {symbol: 'BTCUSDT'}});
        const deal = workerFunctions.prepareDealData({
            marketPrice: 10986.82,
            tradePair: {
                clientId: 1,
                symbol: 'BTCUSDT',
                dealQty: 0.01,
                minProfitRate: 0.005,
                profitIn: 'BASE_ASSET'
            },
            exchangeInfo,
            algorithm: 'MACD-SLC(5m)'
        });
        const result = workerFunctions.prepareOrderData({
            deal,
            exchangeInfo
        });
        result.should.contain.keys([
            'clientId',
            'symbol',
            'side',
            'type',
            'status',
            'price',
            'quantity',
            'credit',
            'creditCurrency',
            'debit',
            'debitCurrency',
        ]);
        const precision = Math.pow(10, 8);
        result.clientId.should.equal(1);
        result.symbol.should.equal('BTCUSDT');
        result.side.should.equal('BUY');
        result.type.should.equal('LIMIT');
        result.status.should.equal('NEW');
        result.price.should.equal(10986.82);
        result.quantity.should.equal(0.01005);
        result.credit.should.equal(0.01005);
        result.creditCurrency.should.equal('BTC');
        result.debit.should.equal(Math.round(10986.82 * 0.01005 * precision) / precision);
        result.debitCurrency.should.equal('USDT');
    });

    it('run worker/e2e test (BNBUSDT/QUOTE_ASSET/dealQty:2/minProfitRate:0.3%)', async function () {
        const results = await workerFunctions.worker({
            data: {
                marketPrice: 37.5147,
                tradePair: {
                    clientId: 1,
                    symbol: 'BNBUSDT',
                    dealQty: 2,
                    minProfitRate: 0.003,
                    profitIn: 'BASE_ASSET'
                },
                algorithm: 'MACD-SLC(15m)'
            }
        });

        results.should.contain.keys('binanceOrder', 'order', 'deal');

        // clean the database
        await results.order.destroy();
        await results.deal.destroy();

    });

});
