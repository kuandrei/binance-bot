# Useful commands

## Sequelize

**Create model**

`$> node_modules/.bin/sequelize model:create --name [model_name] --attributes property_1:string,preoperty_2:string`

**Generate migration**

`$> node_modules/.bin/sequelize migration:generate --name [name_of_your_migration]`

**Generate Seed**

`$> node_modules/.bin/sequelize seed:generate --name [seed_name]`

**Run specific seed**

`$> node_modules/.bin/sequelize db:seed --seed [seed_name]`

## SQLs

**Sync symbol info**

``
truncate table dev_binance_bot.SymbolInfo;
insert into dev_binance_bot.SymbolInfo
select * from binance_bot.SymbolInfo;
``

**Sync orders and deals**

```sql
truncate table dev_binance_bot.Orders;
truncate table dev_binance_bot.Deals;

insert into dev_binance_bot.Deals
select * from binance_bot.Deals;

insert into dev_binance_bot.Orders
select * from binance_bot.Orders;
```