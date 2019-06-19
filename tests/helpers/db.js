require('chai').should();

const dbHelpers = require('../../app/helpers/db');

describe('DB helpers', function () {

    it('getActiveSymbols', async function () {
        const symbols = await dbHelpers.getActiveSymbols();
        symbols.should.be.an('array');
    });

    it('findNewProfitDeals', async function () {
        const deals = await dbHelpers.findNewProfitDeals('BTCUSDT', 20000);
        deals.should.be.an('array');
    });

    it('findOpenStopLossOrder', async function () {
        const deals = await dbHelpers.findOpenStopLossOrder('BTCUSDT', 20000);
        deals.should.be.an('array');
    });

    it('getMinProfitPriceBySymbol', async function () {
        const results = await dbHelpers.getMinProfitPriceBySymbol();
        results.should.be.an('array');
    });

});
