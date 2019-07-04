require('chai').should();

const addTradePairsForAnalysis = require('./../../app/workers/add-trade-pairs-for-analysis');

describe('test add-trade-pairs-for-analysis worker', function () {

    it('test worker function - should return list of added tasks', async function () {

        const results = await  addTradePairsForAnalysis();
        results.should.be.an('array');
        results.length.should.gt(1);
        results[0].should.contain.keys('data');
        results[0].data.should.contain.keys([
            'id',
            'symbol',
            'clientId'
        ]);
    });

});
