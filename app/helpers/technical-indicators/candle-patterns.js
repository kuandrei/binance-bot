const technicalIndicators = require('technicalindicators');

module.exports = (candles) => {
    const input = {
        open: [],
        high: [],
        close: [],
        low: [],
    };
    candles.forEach(candle => {
        input.open.push(parseFloat(candle.open));
        input.high.push(parseFloat(candle.high));
        input.low.push(parseFloat(candle.low));
        input.close.push(parseFloat(candle.close));
    });

    return {
        bullish: technicalIndicators.bullish(input),
        bearish: technicalIndicators.bullish(input),

        abandonedBaby: technicalIndicators.abandonedbaby(input),
        bearishEngulfingPattern: technicalIndicators.bearishengulfingpattern(input),
        bullishEngulfingPattern: technicalIndicators.bullishengulfingpattern(input),
        darkCloudCover: technicalIndicators.darkcloudcover(input),
        downsideTasukiGap: technicalIndicators.downsidetasukigap(input),
        doji: technicalIndicators.doji(input),
        dragonFlyDoji: technicalIndicators.dragonflydoji(input),
        graveStoneDoji: technicalIndicators.gravestonedoji(input),
        bullishHarami: technicalIndicators.bullishharami(input),
        bearishHaramiCross: technicalIndicators.bearishharamicross(input),
        bullishHaramiCross: technicalIndicators.bullishharamicross(input),
        bullishMarubozu: technicalIndicators.bullishmarubozu(input),
        bearishMarubozu: technicalIndicators.bearishmarubozu(input),
        eveningDojiStar: technicalIndicators.eveningdojistar(input),
        eveningStar: technicalIndicators.eveningstar(input),
        bearishHarami: technicalIndicators.bearishharami(input),
        piercingLine: technicalIndicators.piercingline(input),
        bullishSpinningTop: technicalIndicators.bullishspinningtop(input),
        bearishSpinningTop: technicalIndicators.bearishspinningtop(input),
        morningDojiStar: technicalIndicators.morningdojistar(input),
        morningStar: technicalIndicators.morningstar(input),
        threeBlackCrows: technicalIndicators.threeblackcrows(input),
        threeWhiteSoldiers: technicalIndicators.threewhitesoldiers(input),
        // bullishHammer: technicalIndicators.bullishhammer(input),
        // bearishHammer: technicalIndicators.bearishhammer(input),
        // bullishInvertedHammer: technicalIndicators.bullishinvertedhammer(input),
        // bearishInvertedHammer: technicalIndicators.bearishinvertedhammer(input),
        hammer: technicalIndicators.hammerpattern(input),
        hammerUnconfirmed: technicalIndicators.hammerpatternunconfirmed(input),
        hangingMan: technicalIndicators.hangingman(input),
        hangingManUnconfirmed: technicalIndicators.bullishharami(input),
        shootingStar: technicalIndicators.shootingstar(input),
        shootingStarUnconfirmed: technicalIndicators.shootingstarunconfirmed(input),
        tweezerTop: technicalIndicators.tweezertop(input),
        tweezerBottom: technicalIndicators.tweezerbottom(input)
    };
};