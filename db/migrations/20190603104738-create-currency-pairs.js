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
            commission: {
                allowNull: false,
                type: Sequelize.DECIMAL(6, 4)
            },
            commissionType: {
                allowNull: false,
                type: Sequelize.ENUM('STANDARD', 'FIRST_CURRENCY', 'SECOND_CURRENCY'),
                defaultValue: 'STANDARD'
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