'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ExchangeInfo', {
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
            status: {
                allowNull: false,
                type: Sequelize.ENUM('TRADING', 'BREAK')
            },
            baseAsset: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            baseAssetPrecision: {
                allowNull: false,
                type: Sequelize.INTEGER(3).UNSIGNED
            },
            quoteAsset: {
                allowNull: false,
                type: Sequelize.STRING(8)
            },
            quotePrecision: {
                allowNull: false,
                type: Sequelize.INTEGER(3).UNSIGNED
            },
            orderTypes: {
                type: Sequelize.JSON
            },
            icebergAllowed: {
                type: Sequelize.BOOLEAN
            },
            isSpotTradingAllowed: {
                type: Sequelize.BOOLEAN
            },
            isMarginTradingAllowed: {
                type: Sequelize.BOOLEAN
            },
            filters: {
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
        return queryInterface.dropTable('ExchangeInfo');
    }
};