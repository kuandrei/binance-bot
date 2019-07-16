const technicalIndicators = require('technicalindicators');
const R = require('ramda');

module.exports = (candles) => ({
    ADL: adl(candles),
    ADX: adx(candles),
    MACD: macd(candles),
    SMA: sma(candles),
    RSI: rsi(candles),
    BB: bb(candles)
});

function adl(candles) {
    const input = {
        high: R.map(c => parseFloat(c.high), candles),
        low: R.map(c => parseFloat(c.low), candles),
        close: R.map(c => parseFloat(c.close), candles),
        volume: R.map(c => parseFloat(c.volume), candles)
    };

    return technicalIndicators.ADL.calculate(input);
}

function adx(candles) {
    const input = {
        high: R.map(c => parseFloat(c.high), candles),
        low: R.map(c => parseFloat(c.low), candles),
        close: R.map(c => parseFloat(c.close), candles),
        period: 14
    };

    return technicalIndicators.ADX.calculate(input);
}

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

function rsi(candles) {
    const input = {
        values: R.map(c => parseFloat(c.close), candles),
        period: 14
    };

    return technicalIndicators.RSI.calculate(input);
}

function sma(candles) {
    const input = {
        period: 8,
        values: R.map(c => parseFloat(c.close), candles)
    };

    return technicalIndicators.SMA.calculate(input);
}

function bb(candles) {
    const input = {
        period: 14,
        values: R.map(c => parseFloat(c.close), candles),
        stdDev: 2
    };

    return technicalIndicators.BollingerBands.calculate(input);
}