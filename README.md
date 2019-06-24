## Models

### TradePair

Model that holds all exchange info rules for specific symbol

Property      | Description
------------- | -----------------------------------------------------
id            | The record ID
clientId      | The reference to client record
symbol        | The symbol identifier (ex: BTCUSDT)
dealQty       | Defines deal quantity (must meet LOT_SIZE restriction)
minProfitRate | Defines minimum profit rate for deal (minimum: 0.2%)
profitOn      | Enum(BASE_ASSET|QUOTE_ASSET|BOTH)


### Deal

Property       | Description
-------------- | -----------------------------------------------------
id             | The record ID
clientId       | The reference to client record
symbol         | The symbol identifier (ex: BTCUSDT)
buyQty         | The buy quantity of the base asset (see below calculation rules) 
sellQty        | The sell quantity of the quote asset (see below calculation rules) 
openPrice      | The price at the moment order was opened
closePrice     | The price at the moment order was closed
minProfitPrice | The min profit price calculated according to openPrice and the minProfitRate defined in TradePair (1 - 100%)

*Calculation rules*

1. Profit on BASE_ASSET
 
```json
{
  "symbol": "BNBUSDT",
  "dealQty": 2,
  "minProfitRate": 0.003,
  "profitOn": "BASE_ASSET"
}
```

LOT_SIZE.stepSize = 0.01           // stepSizePrecision: 100
PRICE_FILTER.tickSize = 0.00000010 // tickSizePrecision: 10000000

```json
{
  "symbol": "BNBUSDT",
  "buyQty": 2.01,            // Math.ceil((2 + 2 * 0.003) * 100) / 100  
  "sellQty": 2,              // tradePair.dealQty
  "openPrice": 37.5147,      // MarketPrice
  "minProfitPrice": 37.70225 // Math.ceil(37.5147 * 2.01 / 2 * 10^7) / 10^7
}
```

buyQty:         Math.ceil((tradePair.dealQty + tradePair.dealQty * tradePair.minProfitRate ) * stepSizePrecision) / stepSizePrecision
minProfitPrice: Math.ceil(deal.buyQty * deal.openPrice / deal.sellQty * tickSizePrecision) / tickSizePrecision

2. Profit on QUOTE_ASSET
 
```json
{
  "symbol": "BNBUSDT",
  "quantity": 2,
  "minProfitRate": 0.003,
  "profitOn": "BASE_ASSET"
}
```

LOT_SIZE.stepSize = 0.01           // stepSizePrecision: 100
PRICE_FILTER.tickSize = 0.00000010 // tickSizePrecision: 10000000

```json
{
  "symbol": "BNBUSDT",
  "buyQty": 2,    
  "sellQty": 2, // ???
  "openPrice": 37.5147,
  "minProfitPrice": 37.70225 // ???
}
```

buyQty:         ???
minProfitPrice: ???


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



## Workers / crons

---

### Init-trade worker/cron

Initial worker (runs once a minute). Takes all active trade pairs for all clients and adds them to analyze-trade-pair queue.

---

### Analyze-trade-pair worker

Added only by init-trade worker

This worker is responsible for taking a decision whether to place or not a new buy order for given trade pair (specific client). 


@todo - describe the algorithm

Once the algorithm decides to put a new order the open-deal task is added. 

---

### Open-deal worker

Added only by analyze-trade-pair worker

- Creates a new deal record in database
- Places buy order in binance according to trade pair passed in task.data
- Creates order record in database with binanceOrderId

---

### Check-open-orders worker/cron

Checks status of all open orders. Runs once a minute

For each order runs the following flow:

- Retrieve binance order (by order.binanceOrderId)
- Update local order status according to binance order (if different)
- If order status changes to FILLED - updates deal status from NEW to OPEN (if was NEW)

---

### Add-stop-loss-order worker/cron

Runs once a minute.

Flow:

- Checks the current market price of all active symbols.
- For every symbol/price checks if there are open deals with min profit price lower then market price
- If found 
- Adds stop-loss-order in binance
- Create new order in local database

---

### Check-stop-loss-order worker/cron

Runs once a minute, delayed in 30 sec in order to run with check-open-orders worker at the same time.

Flow:

- Checks the current stop loss price for all active symbols
- Gets all active stop-loss-order below the new stop losss price
- For each such order
- Cancels previous order
- Places new one
