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