require('chai').should();

const prepareSymbolInfoWorker = require('../../app/workers/prepare-symbol-info');

describe('test prepare-symbol-tech-analysis worker', function () {

    it('test worker function - should return created SymbolInfo model', async function () {

        let result = await prepareSymbolInfoWorker({
            data: {
                symbol: 'BTCUSDT'
            }
        });

        result = result.toJSON();
        result.should.contain.keys([
            'id',
            'symbol',
            'marketPrice',
            'candles',
            'indicators',
            'patterns'
        ]);
    });

});
