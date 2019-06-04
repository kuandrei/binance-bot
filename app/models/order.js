'use strict';
module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        binanceOrderId: {
            allowNull: false,
            type: DataTypes.STRING(64)
        },
        symbol: {
            allowNull: false,
            type: DataTypes.STRING(16)
        },
        type: {
            allowNull: false,
            type: DataTypes.ENUM('BUY', 'SELL')
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('ACTIVE', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED', 'ERROR')
        },
        price: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        quantity: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        fee: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        feeCurrency: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        credit: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        creditCurrency: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        debit: {
            allowNull: false,
            type: DataTypes.DECIMAL(16, 8)
        },
        debitCurrency: {
            allowNull: false,
            type: DataTypes.STRING(8)
        },
        closedAt: {
            allowNull: true,
            type: DataTypes.DATE
        }
    }, {});
    Order.associate = function ({Client}) {
        Order.belongsTo(Client, {as: 'client'});
    };
    return Order;
};