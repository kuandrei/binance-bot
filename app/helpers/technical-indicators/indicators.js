const technicalIndicators = require('technicalindicators');
const R = require('ramda');

module.exports = (candles) => ({
    MACD: macd(candles)
});

function macd(candles) {
    const input = {
        values: R.map(c => parseFloat(c.close), candles),
        fastPeriod: 5,
        slowPeriod: 8,
        signalPeriod: 3,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };

    return technicalIndicators.MACD.calculate(input);
}