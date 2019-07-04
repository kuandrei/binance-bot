# Workers


---

## Init-trade worker/cron

Initial worker (runs once a minute). Takes all active trade pairs for all clients and adds them to analyze-trade-pair queue.

---

## Analyze-trade-pair worker

Added only by init-trade worker

This worker is responsible for taking a decision whether to place or not a new buy order for given trade pair (specific client). 


@todo - describe the algorithm
tradepair
Once the algorithm decides to put a new order the open-deal task is added. 

---

## Open-deal worker

Added only by analyze-trade-pair worker

- Creates a new deal record in database
- Places buy order in binance according to trade pair passed in task.data
- Creates order record in database with binanceOrderId

---

## Check-open-orders worker/cron

Checks status of all open orders. Runs once a minute

For each order runs the following flow:

- Retrieve binance order (by order.binanceOrderId)
- Update local order status according to binance order (if different)
- If order status changes to FILLED - updates deal status from NEW to OPEN (if was NEW)

---

## Add-stop-loss-order worker/cron

Runs once a minute.

Flow:

- Checks the current market price of all active symbols.
- For every symbol/price checks if there are open deals with min profit price lower then market price
- If found 
- Adds stop-loss-order in binance
- Create new order in local database

---

## Check-stop-loss-order worker/cron

Runs once a minute, delayed in 30 sec in order to run with check-open-orders worker at the same time.

Flow:

- Checks the current stop loss price for all active symbols
- Gets all active stop-loss-order below the new stop losss price
- For each such order
- Cancels previous order
- Places new one


## Refactoring

### Workers

Name                           | Status      | Description
------------------------------ | ----------- | -------------------------------------------------------------------------------------
add-trade-pairs-for-analysis   | Done        | (cron) Adds analyze-trade-pair task for every active/trading trade pair
analyze-trade-pair             | Done        | Checks if the new deal should be opened for given trade pair
open-new-deal                  | Done        | Opens new deal for given trade pair. Sets new buy/sell order (depends on deal type)
check-open-deals               | Done        | (cron) Monitors status of open deals, if become profitable - adds appropriate task
add-stop-loss-order            | Done        | Adds stop loss order for given deal (only for uptrend deals)
add-take-profit-order          | Todo        | Adds take profit order for given deal (only for downtrend deals) 
replace-stop-loss-order        | Todo        | Replaces stop loss order with new one (higher price)
replace-take-profit-order      | Todo        | Replaces take profit order with new one (lower price)
check-open-orders              | Todo        | (cron) Checks if open orders filled 
add-symbols-for-analysis       | Done        | (cron) Adds prepare-symbol-info task for every active/trading symbol  
prepare-symbol-info            | Done        | Prepares symbol info (market price, technical indicators etc) 
update-exchange-info           | Done        | (cron) Syncs local exchange info with Binance
maintenance                    | Done        | (cron) System garbage collector


### Scheduled workers (crons)

Name                        | Cron      | Description
--------------------------- | --------- | ---------------------------------------------------
add-trade-pair-for-analysis | * * * * * | 


 