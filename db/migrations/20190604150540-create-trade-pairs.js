'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('TradePairs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER(11).UNSIGNED
            },
            clientId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                references: {
                    model: 'Clients',
                    key: 'id'
                },
            },
            symbol: {
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                defaultValue: 'ACTIVE'
            },
            dealQty: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            minProfitRate: {
                allowNull: false,
                type: Sequelize.DECIMAL(6, 4)
            },
            profitIn: {
                allowNull: false,
                type: Sequelize.ENUM('BASE_ASSET', 'QUOTE_ASSET'),
                defaultValue: 'BASE_ASSET'
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
        return queryInterface.dropTable('TradePairs');
    }
};