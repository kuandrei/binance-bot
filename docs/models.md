# Models

## TradePair

Model that holds all exchange info rules for specific symbol

Property      | Description
------------- | -----------------------------------------------------
id            | The record ID
clientId      | The reference to client record
symbol        | The symbol identifier (ex: BTCUSDT)
dealQty       | Defines deal quantity (must meet LOT_SIZE restriction)
minProfitRate | Defines minimum profit rate for deal (minimum: 0.2%)
profitOn      | Enum(BASE_ASSET|QUOTE_ASSET|BOTH)


## Deal

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