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
        abandonedBaby: technicalIndicators.abandonedbaby(slice(input, 3)),
        bearishEngulfingPattern: technicalIndicators.bearishengulfingpattern(slice(input, 2)),
        bullishEngulfingPattern: technicalIndicators.bullishengulfingpattern(slice(input, 2)),
        darkCloudCover: technicalIndicators.darkcloudcover(slice(input, 2)),
        downsideTasukiGap: technicalIndicators.downsidetasukigap(slice(input, 3)),
        doji: technicalIndicators.doji(slice(input, 1)),
        dragonFlyDoji: technicalIndicators.dragonflydoji(slice(input, 1)),
        graveStoneDoji: technicalIndicators.gravestonedoji(slice(input, 1)),
        bullishHarami: technicalIndicators.bullishharami(slice(input, 2)),
        bearishHaramiCross: technicalIndicators.bearishharamicross(slice(input, 2)),
        bullishHaramiCross: technicalIndicators.bullishharamicross(slice(input, 2)),
        bullishMarubozu: technicalIndicators.bullishmarubozu(slice(input, 1)),
        bearishMarubozu: technicalIndicators.bearishmarubozu(slice(input, 1)),
        eveningDojiStar: technicalIndicators.eveningdojistar(slice(input, 3)),
        eveningStar: technicalIndicators.eveningstar(slice(input, 3)),
        bearishHarami: technicalIndicators.bearishharami(slice(input, 2)),
        piercingLine: technicalIndicators.piercingline(slice(input, 2)),
        bullishSpinningTop: technicalIndicators.bullishspinningtop(slice(input, 1)),
        bearishSpinningTop: technicalIndicators.bearishspinningtop(slice(input, 1)),
        morningDojiStar: technicalIndicators.morningdojistar(slice(input, 3)),
        morningStar: technicalIndicators.morningstar(slice(input, 3)),
        threeBlackCrows: technicalIndicators.threeblackcrows(slice(input, 3)),
        threeWhiteSoldiers: technicalIndicators.threewhitesoldiers(slice(input, 3)),
        // bullishHammer: technicalIndicators.bullishhammer(slice(input, 1)),
        // bearishHammer: technicalIndicators.bearishhammer(slice(input, 1)),
        // bullishInvertedHammer: technicalIndicators.bullishinvertedhammer(slice(input, 1)),
        // bearishInvertedHammer: technicalIndicators.bearishinvertedhammer(slice(input, 1)),
        hammer: technicalIndicators.hammerpattern(slice(input, 5)),
        hammerUnconfirmed: technicalIndicators.hammerpatternunconfirmed(slice(input, 5)),
        hangingMan: technicalIndicators.hangingman(slice(input, 5)),
        hangingManUnconfirmed: technicalIndicators.hangingmanunconfirmed(slice(input, 5)),
        shootingStar: technicalIndicators.shootingstar(slice(input, 5)),
        shootingStarUnconfirmed: technicalIndicators.shootingstarunconfirmed(slice(input, 5)),
        tweezerTop: technicalIndicators.tweezertop(slice(input, 5)),
        tweezerBottom: technicalIndicators.tweezerbottom(slice(input, 5))
    };
};

function slice(input, numOfElements) {
    return {
        open: input.open.slice(-1 * numOfElements),
        high: input.high.slice(-1 * numOfElements),
        close: input.close.slice(-1 * numOfElements),
        low: input.low.slice(-1 * numOfElements)
    }
}