require('chai').should();

const helpers = require('../../app/helpers/technical-indicators');

describe('test technical indicators helpers', function () {

    it('test calculateSymbolTechIndicators for BTCUSDT returns all required props', async function () {

        const result = await helpers.calculateSymbolTechIndicators('BTCUSDT');

        result.should.be.an('object');
        result.should.include.keys([
            'symbol',
            'marketPrice',
            'candles',
            'indicators',
            'patterns'
        ]);
        result.candles.should.be.an('array');
        result.candles.length.should.be.gt(1);
        result.candles[0].should.include.keys(['interval', 'data']);
        result.candles[0].interval.should.equal('1m');
        result.candles[0].data.should.be.an('array');
        result.candles[0].data[0].should.include.keys(['low', 'high', 'open', 'close']);

        result.indicators.should.be.an('array');
        result.indicators.length.should.be.gt(1);
        result.indicators[0].should.include.keys(['interval', 'data']);
        result.indicators[0].interval.should.equal('1m');
        result.indicators[0].data.should.be.an('object');
        result.indicators[0].data.should.include.keys(['MACD', 'SMA', 'RSI', 'BB']);

        result.patterns.should.be.an('array');
        result.patterns.length.should.be.gt(1);
        result.patterns[0].should.include.keys(['interval', 'data']);
        result.patterns[0].interval.should.equal('1m');
        result.patterns[0].data.should.be.an('object');
        result.patterns[0].data.should.include.keys(['CandlestickPattern', 'MACD', 'RSI', 'BB']);
        result.patterns[0].data.CandlestickPattern.should.include.keys([
            'doji',
            'hammer',
            'hangingMan',
            'tweezerTop',
            'eveningStar',
            'morningStar',
            'piercingLine',
            'shootingStar',
            'abandonedBaby',
            'bearishHarami',
            'bullishHarami',
            'dragonFlyDoji',
            'tweezerBottom',
            'darkCloudCover',
            'graveStoneDoji',
            'bearishMarubozu',
            'bullishMarubozu',
            'eveningDojiStar',
            'morningDojiStar',
            'threeBlackCrows',
            'downsideTasukiGap',
            'hammerUnconfirmed',
            'bearishHaramiCross',
            'bearishSpinningTop',
            'bullishHaramiCross',
            'bullishSpinningTop',
            'threeWhiteSoldiers',
            'hangingManUnconfirmed',
            'bearishEngulfingPattern',
            'bullishEngulfingPattern',
            'shootingStarUnconfirmed'
        ]);
        result.patterns[0].data.MACD.should.include.keys(['SLC', 'PATTERN']);

    });

});
