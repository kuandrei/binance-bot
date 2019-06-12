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
                    model: 'Clients',
                    key: 'id'
                },
            },
            dealId: {
                allowNull: false,
                type: Sequelize.INTEGER(11).UNSIGNED,
                references: {
                    model: 'Deals',
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
            side: {
                allowNull: false,
                type: Sequelize.ENUM(
                    'BUY',
                    'SELL'
                )
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM(
                    'LIMIT',
                    'MARKET',
                    'STOP_LOSS',
                    'STOP_LOSS_LIMIT',
                    'TAKE_PROFIT',
                    'TAKE_PROFIT_LIMIT',
                    'LIMIT_MAKER'
                )
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM(
                    'NEW',
                    'PARTIALLY_FILLED',
                    'FILLED',
                    'CANCELED',
                    'REJECTED',
                    'EXPIRED',
                    'ERROR'
                )
            },
            error: {
                type: Sequelize.JSON
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