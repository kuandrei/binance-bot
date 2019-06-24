
# Workers / crons

---

## Init-trade worker/cron

Initial worker (runs once a minute). Takes all active trade pairs for all clients and adds them to analyze-trade-pair queue.

---

## Analyze-trade-pair worker

Added only by init-trade worker

This worker is responsible for taking a decision whether to place or not a new buy order for given trade pair (specific client). 


@todo - describe the algorithm

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
