'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('TradeRules', {
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
            name: {
                allowNull: false,
                type: Sequelize.STRING(128)
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE')
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM('BUY', 'SELL')
            },
            conditionMatch: {
                allowNull: false,
                type: Sequelize.ENUM('ANY', 'ALL'),
                defaultValue: 'ALL'
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
        return queryInterface.dropTable('TradeRules');
    }
};