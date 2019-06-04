'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER(11).UNSIGNED
            },
            clientId: {
                allowNull: false,
                type: Sequelize.INTEGER(11).UNSIGNED,
                references: {
                    model: 'Client',
                    key: 'id'
                },
            },
            binanceOrderId: {
                allowNull: false,
                type: Sequelize.STRING(64)
            },
            symbol: {
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM('BUY', 'SELL')
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM('ACTIVE', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED', 'ERROR')
            },
            price: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            quantity: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            fee: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            feeCurrency: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            credit: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            creditCurrency: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            debit: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            debitCurrency: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            closedAt: {
                allowNull: true,
                type: Sequelize.DATE
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
        return queryInterface.dropTable('Orders');
    }
};