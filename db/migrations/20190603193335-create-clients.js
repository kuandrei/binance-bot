'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Clients', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER(11).UNSIGNED
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING(128)
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                defaultValue: 'ACTIVE'
            },
            apiKey: {
                allowNull: false,
                type: Sequelize.STRING(128),
            },
            apiSecret: {
                allowNull: false,
                type: Sequelize.STRING(128)
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('Clients');
    }
};

