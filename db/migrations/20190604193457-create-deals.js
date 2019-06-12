'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Deals', {
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
            openPrice: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            quantity: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            minProfitPrice: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM('NEW', 'OPEN', 'CLOSED', 'ERROR'),
                defaultValue: 'NEW'
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
        return queryInterface.dropTable('Deals');
    }
};