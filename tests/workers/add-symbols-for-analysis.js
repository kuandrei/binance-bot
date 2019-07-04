require('chai').should();

const addSymbolsForAnalysisWorker = require('../../app/workers/add-symbols-for-analysis');

describe('test add-symbols-for-analysis worker', function () {

    it('test worker function - should return list of added tasks', async function () {

        const results = await addSymbolsForAnalysisWorker();

        results.should.be.an('array');
        results.length.should.gt(1);

        results[0].should.contain.keys('data');
        results[0].data.should.contain.keys('symbol');
    });

});
