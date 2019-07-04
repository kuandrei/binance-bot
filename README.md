# Documentation

- [Models](/docs/models.md)
- [Workers](/docs/workers.md)

---

## Calculation rules

### UPTREND trend

1. Profit in **BASE_ASSET**
 
```json
{
  "symbol": "BNBUSDT",
  "dealQty": 2,
  "minProfitRate": 0.003,
  "profitIn": "BASE_ASSET"
}
```

LOT_SIZE.stepSize = 0.01       // stepSizePrecision: 100<br>
PRICE_FILTER.tickSize = 0.0001 // tickSizePrecision: 10000

```json
{
  "symbol": "BNBUSDT",
  "type": "UPTREND",
  "buyQty": 2.01, 
  "sellQty": 2,
  "openPrice": 37.5147,
  "minProfitPrice": 37.7023
}
```

buyQty: Math.ceil((2 + 2 * 0.003) * 100) / 100 <br>
*Math.ceil((tradePair.dealQty + tradePair.dealQty * tradePair.minProfitRate ) * stepSizePrecision) / stepSizePrecision*<br>
sellQty: tradePair.dealQty<br>
openPrice: marketPrice<br>
minProfitPrice: Math.ceil(37.5147 * 2.01 / 2 * 10000) / 10000<br>
*Math.ceil(deal.buyQty * deal.openPrice / deal.sellQty * tickSizePrecision) / tickSizePrecision*

2. Profit in **QUOTE_ASSET**
 
```json
{
  "symbol": "BNBUSDT",
  "quantity": 2,
  "minProfitRate": 0.003,
  "profitIn": "BASE_ASSET"
}
```

PRICE_FILTER.tickSize = 0.0001 // tickSizePrecision: 10000

```json
{
  "symbol": "BNBUSDT",
  "type": "UPTREND",
  "buyQty": 2,    
  "sellQty": 2,
  "openPrice": 37.5147,
  "minProfitPrice": 37.6273
}
```

buyQty: tradePair.dealQty<br>
sellQty: tradePair.dealQty<br>
openPrice: marketPrice<br>
minProfitPrice: Math.ceil((37.5147 + 37.5147 * 0.003) * 10000) / 10000<br>
*Math.ceil((deal.openPrice + deal.openPrice * tradePair.minProfitRate) * tickSizePrecision) / tickSizePrecision*

### DOWNTREND trend

1. Profit in **BASE_ASSET**
 
```json
{
  "symbol": "BNBUSDT",
  "dealQty": 2,
  "minProfitRate": 0.003,
  "profitIn": "BASE_ASSET"
}
```

LOT_SIZE.stepSize = 0.01       // stepSizePrecision: 100<br>
PRICE_FILTER.tickSize = 0.0001 // tickSizePrecision: 10000

```json
{
  "symbol": "BNBUSDT",
  "type": "DOWNTREND",
  "buyQty": 2.01, 
  "sellQty": 2,
  "openPrice": 37.5147,
  "minProfitPrice": 37.3281
}
```

buyQty: Math.ceil((2 + 2 * 0.003) * 100) / 100 <br>
*Math.ceil((tradePair.dealQty + tradePair.dealQty * tradePair.minProfitRate ) * stepSizePrecision) / stepSizePrecision*<br>
sellQty: tradePair.dealQty<br>
openPrice: marketPrice<br>
minProfitPrice: Math.ceil(37.5147 * 2 / 2.01 * 10000) / 10000<br>
*Math.ceil(deal.buyQty * deal.sellQty / deal.openPrice * tickSizePrecision) / tickSizePrecision*

2. Profit in **QUOTE_ASSET**
 
```json
{
  "symbol": "BNBUSDT",
  "quantity": 2,
  "minProfitRate": 0.003,
  "profitIn": "BASE_ASSET"
}
```

PRICE_FILTER.tickSize = 0.0001 // tickSizePrecision: 10000

```json
{
  "symbol": "BNBUSDT",
  "type": "DOWNTREND",
  "buyQty": 2,    
  "sellQty": 2,
  "openPrice": 37.5147,
  "minProfitPrice": 37.4025
}
```

buyQty: tradePair.dealQty<br>
sellQty: tradePair.dealQty<br>
openPrice: marketPrice<br>
minProfitPrice: Math.ceil((37.5147 / 1 + 0.003) * 10000) / 10000<br>
*Math.ceil(deal.openPrice / (1 + tradePair.minProfitRate) * tickSizePrecision) / tickSizePrecision*


## Symbol filters

### PRICE_FILTER

The PRICE_FILTER defines the price rules for a symbol. There are 3 parts:

- minPrice defines the minimum price/stopPrice allowed; disabled on minPrice == 0.
- maxPrice defines the maximum price/stopPrice allowed; disabled on maxPrice == 0.
- tickSize defines the intervals that a price/stopPrice can be increased/decreased by; disabled on tickSize == 0.

Any of the above variables can be set to 0, which disables that rule in the price filter. In order to pass the price filter, the following must be true for price/stopPrice of the enabled rules:

- price >= minPrice
- price <= maxPrice
- (price-minPrice) % tickSize == 0

Used in open-deal worker


### LOT_SIZE

The LOT_SIZE filter defines the quantity (aka "lots" in auction terms) rules for a symbol. There are 3 parts:
    
- minQty defines the minimum quantity/icebergQty allowed.
- maxQty defines the maximum quantity/icebergQty allowed.
- stepSize defines the intervals that a quantity/icebergQty can be increased/decreased by.

In order to pass the lot size, the following must be true for quantity/icebergQty:
    
- quantity >= minQty
- quantity <= maxQty
- (quantity-minQty) % stepSize == 0

Used in trade pair create/update methods.

Validates that buyQty/sellQty meets the requirements.


### MAX_NUM_ALGO_ORDERS

Used in add-stop-loss order worker. 
If the number of open stop loss order more than defined by filter, then SELL_LIMIT order added instead with price = marketPrice = 0.1%


### PERCENT_PRICE

The PERCENT_PRICE filter defines valid range for a price based on the average of the previous trades. avgPriceMins is the number of minutes the average price is calculated over. 0 means the last price is used.

In order to pass the percent price, the following must be true for price:

price <= weightedAveragePrice * multiplierUp
price >= weightedAveragePrice * multiplierDown
/exchangeInfo format:

  {
    "filterType": "PERCENT_PRICE",
    "multiplierUp": "1.3000",
    "multiplierDown": "0.7000",
    "avgPriceMins": 5
  }