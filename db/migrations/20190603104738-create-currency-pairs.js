'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('CurrencyPairs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER(11).UNSIGNED
            },
            symbol: {
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            firstCurrency: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            firstCurrencyPrecision: {
                allowNull: false,
                type: Sequelize.INTEGER(3).UNSIGNED
            },
            secondCurrency: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            secondCurrencyPrecision: {
                allowNull: false,
                type: Sequelize.INTEGER(3).UNSIGNED
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('CurrencyPairs');
    }
};