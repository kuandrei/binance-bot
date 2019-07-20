'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('SymbolInfo', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            symbol: {
                allowNull: false,
                type: Sequelize.STRING
            },
            marketPrice: {
                allowNull: false,
                type: Sequelize.DECIMAL(16, 8)
            },
            candles: {
                allowNull: false,
                type: Sequelize.JSON
            },
            indicators: {
                allowNull: false,
                type: Sequelize.JSON
            },
            patterns: {
                allowNull: false,
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
        })
            .then(() => queryInterface.addIndex('SymbolInfo', ['symbol', 'createdAt']));
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('SymbolInfo');
    }
};