const should = require('chai').should();

const workerFunctions = require('./../../app/workers/analyze-trade-pair');
const {TradePair} = require('../../app/models');
const symbolInfo = require('./symbol-info.json');

describe('test analyze-trade-pair worker', function () {

    it('test retrieve rules', async function () {
        const tradePair = await TradePair.findOne({
            include: {
                association: 'rules',
                include: 'conditions',
                where: {
                    status: 'ACTIVE'
                }
            }
        });
        const rules = tradePair.rules.filter(r => r.type === (tradePair.tradeOn === 'UPTREND' ? 'BUY' : 'SELL'));
        rules.should.be.an('array');
    });

    describe('test checkBalance function (UPTREND use cases)', function () {

        it('test use case: (BTCUSDT/BUY:0.005BTC/PRICE:10000/BALANCE:100USDT)  - should return true', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'UPTREND',
                    profitIn: 'BASE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.00
                        },
                        USDT: {
                            free: 100
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(true);
        });

        it('test use case: (BTCUSDT/BUY:0.005BTC/PRICE:10000/BALANCE:10USDT) - should return false', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'UPTREND',
                    profitIn: 'BASE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.00
                        },
                        USDT: {
                            free: 10
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('test use case: (BTCUSDT/BUY:0.005BTC/PRICE:10000/BALANCE:50USDT/BASE_ASSET) - should return false', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'UPTREND',
                    profitIn: 'BASE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.00
                        },
                        USDT: {
                            free: 50
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('test use case: (BTCUSDT/BUY:0.005BTC/PRICE:10000/BALANCE:50.01USDT/QUOTE_ASSET) - should return true', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'UPTREND',
                    profitIn: 'QUOTE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.00
                        },
                        USDT: {
                            free: 50.01
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(true);
        });

    });

    describe('test checkBalance function (DOWNTREND use cases)', function () {

        it('test use case: (BTCUSDT/SELL:0.005BTC/PRICE:10000/BALANCE:0.5BTC)  - should return true', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'DOWNTREND',
                    profitIn: 'BASE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.5
                        },
                        USDT: {
                            free: 0
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(true);
        });

        it('test use case: (BTCUSDT/SELL:0.005BTC/PRICE:10000/BALANCE:0.001BTC) - should return false', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'DOWNTREND',
                    profitIn: 'BASE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.001
                        },
                        USDT: {
                            free: 0
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('test use case: (BTCUSDT/SELL:0.005BTC/PRICE:10000/BALANCE:0.005BTC/BASE_ASSET) - should return true', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'DOWNTREND',
                    profitIn: 'BASE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.005
                        },
                        USDT: {
                            free: 0
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(true);
        });

        it('test use case: (BTCUSDT/SELL:0.005BTC/PRICE:10000/BALANCE:0.005BTC/QUOTE_ASSET) - should return true', async function () {
            const ctx = {
                tradePair: {
                    symbol: 'BTCUSDT',
                    dealQty: 0.005,
                    minProfitRate: 0.003,
                    tradeOn: 'DOWNTREND',
                    profitIn: 'QUOTE_ASSET',
                },
                tradePairInfo: {
                    balances: {
                        BTC: {
                            free: 0.005
                        },
                        USDT: {
                            free: 0
                        }
                    }
                },
                exchangeInfo: {
                    baseAsset: 'BTC',
                    quoteAsset: 'USDT'
                },
                symbolInfo: {
                    marketPrice: 10000
                }
            };
            const result = await workerFunctions.checkBalance(ctx);
            result.should.be.a('boolean');
            result.should.equal(true);
        });

    });

    describe('test checkRestrictions function', function () {

        const restrictions = [{
            name: 'Max 3 open deals',
            filter: {
                openDeals: {
                    gte: 3
                }
            }
        }];

        it('test restriction match', async function () {
            const tradePairInfo = {
                newDeals: 0,
                openDeals: 50,
                openDealsBelowMarketPrice: 10,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0
            };
            const result = await workerFunctions.checkRestrictions({tradePairInfo, restrictions});
            result.should.deep.equal({
                name: 'Max 3 open deals',
                filter: {
                    openDeals: {
                        gte: 3
                    }
                }
            });
        });

        it('test restriction not matched', async function () {
            const tradePairInfo = {
                newDeals: 0,
                openDeals: 2,
                openDealsBelowMarketPrice: 10,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0
            };
            const result = await workerFunctions.checkRestrictions({tradePairInfo, restrictions});
            should.not.exist(result);
        });

    });

    describe('test checkRules function', function () {

        it('test rule with one condition matched', async function () {
            const rules = [{
                name: '3m doji',
                conditionMatch: 'ALL',
                type: 'BUY',
                conditions: [{
                    interval: '3m',
                    indicator: 'CandlestickPattern',
                    filter: {
                        doji: true
                    }
                }]
            }];
            const result = await workerFunctions.checkRules({symbolInfo, rules});
            result.should.be.an('object');
            result.should.contain.keys('name', 'type');
            result.name.should.equal('3m doji');
            result.type.should.equal('BUY');
        });

        it('test rule with 2 conditions matched (conditionMatch:ALL)', async function () {
            const rules = [{
                name: '5m unconfirmed hammer + MACD pattern',
                conditionMatch: 'ALL',
                type: 'SELL',
                conditions: [{
                    interval: '5m',
                    indicator: 'CandlestickPattern',
                    filter: {
                        hammerUnconfirmed: true
                    }
                }, {
                    interval: '5m',
                    indicator: 'MACD',
                    filter: {
                        PATTERN: {like: '%,N,N'}
                    }
                }]
            }];
            const result = await workerFunctions.checkRules({symbolInfo, rules});
            result.should.be.an('object');
            result.should.contain.keys('name', 'type');
            result.name.should.equal('5m unconfirmed hammer + MACD pattern');
            result.type.should.equal('SELL');
        });

        it('test rule with 2 conditions matched (conditionMatch:ANY)', async function () {
            const rules = [{
                name: '3m, 5m MACD patterns',
                conditionMatch: 'ANY',
                type: 'SELL',
                conditions: [{
                    interval: '3m',
                    indicator: 'MACD',
                    filter: {
                        PATTERN: {like: 'N,N,N,N,N'}
                    }
                }, {
                    interval: '5m',
                    indicator: 'MACD',
                    filter: {
                        PATTERN: {like: '%,N,N'}
                    }
                }]
            }];
            const result = await workerFunctions.checkRules({symbolInfo, rules});
            result.should.be.an('object');
            result.should.contain.keys('name', 'type');
            result.name.should.equal('3m, 5m MACD patterns');
            result.type.should.equal('SELL');
        });

        it('test no rules matched', async function () {
            const rules = [{
                name: '3m, 5m MACD patterns',
                conditionMatch: 'ALL',
                type: 'SELL',
                conditions: [{
                    interval: '3m',
                    indicator: 'MACD',
                    filter: {
                        PATTERN: {like: 'N,N,N,N,N'}
                    }
                }, {
                    interval: '5m',
                    indicator: 'MACD',
                    filter: {
                        PATTERN: {like: '%,N,N'}
                    }
                }]
            }];
            const result = await workerFunctions.checkRules({symbolInfo, rules});
            should.not.exist(result);
        });

        it('test special cases 1h/MACD/SLC/BULLISH + 1h/RSI<30', async function () {
            const rules = [{
                name: '1h/MACD/SLC/BULLISH + 1h/RSI<30',
                conditionMatch: 'ALL',
                type: 'BUY',
                conditions: [{
                    interval: '1h',
                    indicator: 'MACD',
                    filter: {
                        SLC: true,
                        SLC_TYPE: 'BULLISH'
                    }
                }, {
                    interval: '1h',
                    indicator: 'RSI',
                    filter: {
                        lt: 30
                    }
                }]
            }];
            const result = await workerFunctions.checkRules({symbolInfo, rules});
            result.should.be.an('object');
            result.should.contain.keys('name', 'type');
            result.name.should.equal('1h/MACD/SLC/BULLISH + 1h/RSI<30');
            result.type.should.equal('BUY');
        });

    });

    it('test e2e flow - should return tradeInfo model', async function () {
        const tradePair = await TradePair.findOne();
        const result = (await workerFunctions.worker({
            data: tradePair.toJSON()
        })).toJSON();
        result.should.be.an('object');
        result.should.contain.keys([
            'id',
            'tradeStatus'
        ]);
    });

});
