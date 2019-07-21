# Workers

Name                         | Cron      | Status | Description
---------------------------- | --------- | ------ | -------------------------------------------------------------------------------------
add-trade-pairs-for-analysis | * * * * * | Done   | Adds analyze-trade-pair task for every active/trading trade pair
analyze-trade-pair           |           | Done   | Checks if the new deal should be opened for given trade pair
open-new-deal                |           | Done   | Opens new deal for given trade pair. Sets new buy/sell order (depends on deal type)
check-open-deals             | * * * * * | Done   | Monitors status of open deals, if become profitable - adds appropriate task
add-stop-loss-order          |           | Done   | Adds stop loss order for given deal (only for uptrend deals)
add-take-profit-order        |           | Done   | Adds take profit order for given deal (only for downtrend deals) 
check-open-orders            | * * * * * | Done   | Checks if open orders filled 
replace-stop-loss-order      |           | Done   | Replaces stop loss order with new one (higher price) (NO AUTOMATIC TESTS)
replace-take-profit-order    |           | Done   | Replaces take profit order with new one (lower price) (NO AUTOMATIC TESTS)
add-sell-market-price-order  |           | Todo   | Adds sell order in market price
add-buy-market-price-order   |           | Todo   | Adds buy order in market price
add-symbols-for-analysis     | * * * * * | Done   | Adds prepare-symbol-info task for every active/trading symbol  
prepare-symbol-info          |           | Done   | Prepares symbol info (market price, technical indicators etc) 
update-exchange-info         | 0 2 * * * | Done   | Syncs local exchange info with Binance
maintenance                  | 0 3 * * * | Done   | System garbage collector


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

<div class="mxgraph" style="max-width:100%;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;toolbar&quot;:&quot;zoom layers lightbox&quot;,&quot;edit&quot;:&quot;_blank&quot;,&quot;xml&quot;:&quot;&lt;mxfile modified=\&quot;2019-07-17T14:35:45.623Z\&quot; host=\&quot;www.draw.io\&quot; agent=\&quot;Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36\&quot; etag=\&quot;0eZcFaiTGhh9TXyGR7m-\&quot; version=\&quot;10.9.8\&quot; type=\&quot;device\&quot;&gt;&lt;diagram name=\&quot;Page-1\&quot; id=\&quot;edf60f1a-56cd-e834-aa8a-f176f3a09ee4\&quot;&gt;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&lt;/diagram&gt;&lt;/mxfile&gt;&quot;}"></div>
<script type="text/javascript" src="https://www.draw.io/js/viewer.min.js"></script>

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



 