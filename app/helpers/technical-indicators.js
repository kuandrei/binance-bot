const binanceHelpers = require('./../helpers/binance');
const candlePatterns = require('./technical-indicators/candle-patterns');
const technicalIndicators = require('./technical-indicators/indicators');

// '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'
const intervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];

async function calculateSymbolTechIndicators(symbol) {

    const candles = await Promise.all(
        intervals.map(interval => binanceHelpers.getCandles({symbol, interval, limit: 30}))
        // prepares array of function to execute
        // binanceHelpers.getCandles({symbol, interval: '1m', limit: 30}),
        // binanceHelpers.getCandles({symbol, interval: '3m', limit: 30}),
        // binanceHelpers.getCandles({symbol, interval: '5m', limit: 30})
    );
    const indicators = candles.map(intervalCandles => technicalIndicators(intervalCandles));

    return {
        symbol: symbol,
        marketPrice: await binanceHelpers.symbolMarketPrice(symbol),
        candles: candles.map((data, index) => ({
            interval: intervals[index],
            data: data
        })),
        indicators:  indicators.map((data, index) => ({
            interval: intervals[index],
            data: data
        })),
        patterns: intervals.map((interval, index) => ({
            interval,
            data: {
                CandlestickPattern: candlePatterns(candles[index]),
                MACD: macd(indicators[index]),
                RSI: rsi(indicators[index]),
                BB: bb(indicators[index]),
            }
        }))
    };
}

module.exports = {
    calculateSymbolTechIndicators
};

function macd(indicators) {
    const lastElement = indicators.MACD.slice(-1).shift();
    const beforeTheLast = indicators.MACD.slice(-2).shift();
    const result = {
        PATTERN: indicators.MACD.slice(-5).map(item => item.MACD > 0 ? 'P' : 'N').join(','),
        SLC: (lastElement.MACD * beforeTheLast.MACD) < 0
    };
    if (result.SLC)
        result.SLC_TYPE = lastElement.MACD > 0 ? 'BULLISH' : 'BEARISH';

    return result;
}

function rsi(indicators) {
    return indicators.RSI.slice(-1).shift();
}

function bb(indicators) {
    return indicators.BB.slice(-1).shift();
}