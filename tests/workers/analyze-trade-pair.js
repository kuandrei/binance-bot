require('chai').should();

const stateHelpers = require('./../../app/helpers/state');
const workerFunctions = require('./../../app/workers/analyze-trade-pair');
const {TradePair} = require('../../app/models');

describe('Analyze-trade-pair worker', function () {

    describe('checkRestrictions', function () {

        it('10 open deals below market price, 0 in profit - should return false', async function () {
            const state = {
                newDeals: 0,
                openDeals: 50,
                openDealsBelowMarketPrice: 10,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0
            };
            const result = await workerFunctions.checkRestrictions(state);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('12 open deals below market price, 2 profitable - should return true', async function () {
            const state = {
                newDeals: 0,
                openDeals: 12,
                openDealsBelowMarketPrice: 10,
                openDealsAboveMarketPrice: 2,
                openDealsInProfit: 2
            };
            const result = await workerFunctions.checkRestrictions(state);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('max 2 open deals in 0.25% range - should return false', async function () {
            const state = {
                newDeals: 0,
                openDeals: 50,
                openDealsBelowMarketPrice: 0,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0,
                openDealsInRange: {
                    '0.25%': 2
                }
            };
            const result = await workerFunctions.checkRestrictions(state);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('max 3 open deals in 0.5% range - should return false', async function () {
            const state = {
                newDeals: 0,
                openDeals: 50,
                openDealsBelowMarketPrice: 0,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0,
                openDealsInRange: {
                    '0.5%': 3
                }
            };
            const result = await workerFunctions.checkRestrictions(state);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('max 4 open deals in 0.75% range - should return false', async function () {
            const state = {
                newDeals: 0,
                openDeals: 50,
                openDealsBelowMarketPrice: 0,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0,
                openDealsInRange: {
                    '0.75%': 4
                }
            };
            const result = await workerFunctions.checkRestrictions(state);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

        it('max 5 open deals in 1.0% range - should return false', async function () {
            const state = {
                newDeals: 0,
                openDeals: 50,
                openDealsBelowMarketPrice: 0,
                openDealsAboveMarketPrice: 0,
                openDealsInProfit: 0,
                openDealsInRange: {
                    '1.0%': 5
                }
            };
            const result = await workerFunctions.checkRestrictions(state);
            result.should.be.a('boolean');
            result.should.equal(false);
        });

    });

    describe('shouldOpenDeal', function () {

        it('sanity - check no errors', async function () {
            const tradePair = await TradePair.findOne();
            const state = await stateHelpers.tradePairState(tradePair);
            const result = workerFunctions.shouldOpenDeal(state);
            result.should.be.an('object');
            result.should.contain.keys('openDeal');
            result.openDeal.should.be.a('boolean');
        });

        it('MACD cross line (pattern1) - should return the algorithm name', async function () {
            const state = require('./states/MACD-CROSS-LINE-patter1.json');
            const result = workerFunctions.shouldOpenDeal(state);
            result.should.be.an('object');
            result.should.contain.keys('openDeal', 'algorithm');
            result.openDeal.should.equal(true);
            result.algorithm.should.equal('MACD-SLC/PATTERN:1m (*,*,*,*,P), 3m (N,N,N,N,P), 5m (N,N,N,N,N)');
        });

    });

});
