const R = require('ramda');
const {ExchangeInfo, SymbolInfo} = require('./../models');

async function calculateSymbolStopLossPrice(symbol) {
    if (Array.isArray(symbol)) {
        return Promise.all(
            symbol.map(async s => ({
                symbol: s,
                stopLossPrice: await calculateSymbolStopLossPrice(s)
            }))
        );
    }

    let stopLossPrice, tickSizePrecision = 1;
    const exchangeInfo = await ExchangeInfo.findOne({
        where: {symbol}
    });
    if (!exchangeInfo)
        throw new Error(`no exchange info data found for ${symbol}`);
    const symbolInfo = await SymbolInfo.findOne({
        where: {
            symbol
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });
    if (!symbolInfo)
        throw new Error(`no symbol info data found for ${symbol}`);

    const priceFilter = exchangeInfo.filters.find(filter => filter.filterType === 'PRICE_FILTER');
    if (priceFilter && priceFilter.tickSize !== 0)
        tickSizePrecision = 1 / priceFilter.tickSize;

    const indicatorData1m = symbolInfo.indicators.find(info => info.interval === '1m').data;
    const indicatorData3m = symbolInfo.indicators.find(info => info.interval === '3m').data;
    const indicatorData5m = symbolInfo.indicators.find(info => info.interval === '5m').data;

    const lastMacd3m = indicatorData1m.MACD[indicatorData1m.MACD.length - 1];
    const lastSmaValue3m = indicatorData3m.SMA[indicatorData3m.SMA.length - 1];
    const lowestSmaValue = R.min(
        R.reduce(R.min, Infinity, indicatorData1m.SMA),
        R.reduce(R.min, Infinity, indicatorData3m.SMA),
        R.reduce(R.min, Infinity, indicatorData5m.SMA)
    );

    if (lastMacd3m.MACD > 0)
        stopLossPrice = parseFloat(lastSmaValue3m - lastSmaValue3m * 0.01 / 100);
    else
        stopLossPrice = parseFloat(lowestSmaValue - lowestSmaValue * 0.01 / 100);

    return Math.ceil(stopLossPrice * tickSizePrecision) / tickSizePrecision;
}

async function calculateSymbolTakeProfitPrice(symbol) {
    if (Array.isArray(symbol)) {
        return Promise.all(
            symbol.map(async s => ({
                symbol: s,
                takeProfitPrice: await calculateSymbolTakeProfitPrice(s)
            }))
        );
    }

    let takeProfitPrice, tickSizePrecision = 1;
    const exchangeInfo = (await ExchangeInfo.findOne({
        where: {symbol}
    })).toJSON();
    const symbolInfo = (await SymbolInfo.findOne({
        where: {
            symbol
        },
        order: [
            ['createdAt', 'DESC']
        ]
    })).toJSON();

    const priceFilter = exchangeInfo.filters.find(filter => filter.filterType === 'PRICE_FILTER');
    if (priceFilter && priceFilter.tickSize !== 0)
        tickSizePrecision = 1 / priceFilter.tickSize;

    const indicatorData1m = symbolInfo.indicators.find(info => info.interval === '1m').data;
    const indicatorData3m = symbolInfo.indicators.find(info => info.interval === '3m').data;
    const indicatorData5m = symbolInfo.indicators.find(info => info.interval === '5m').data;

    const lastMacd3m = indicatorData1m.MACD[indicatorData1m.MACD.length - 1];
    const lastSmaValue3m = indicatorData3m.SMA[indicatorData3m.SMA.length - 1];
    const highestSmaValue = R.max(
        R.reduce(R.max, Infinity, indicatorData1m.SMA),
        R.reduce(R.max, Infinity, indicatorData3m.SMA),
        R.reduce(R.max, Infinity, indicatorData5m.SMA)
    );

    if (lastMacd3m.MACD < 0)
        takeProfitPrice = parseFloat(lastSmaValue3m + lastSmaValue3m * 0.01 / 100);
    else
        takeProfitPrice = parseFloat(highestSmaValue + highestSmaValue * 0.01 / 100);

    return Math.ceil(takeProfitPrice * tickSizePrecision) / tickSizePrecision;
}

module.exports = {
    calculateSymbolStopLossPrice,
    calculateSymbolTakeProfitPrice
};