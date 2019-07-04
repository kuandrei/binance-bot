'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('TradeRestrictions', {
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
            filter: {
                type: Sequelize.JSON
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
        return queryInterface.dropTable('TradeRestrictions');
    }
};