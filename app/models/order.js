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
        side: {
            allowNull: false,
            type: DataTypes.ENUM(
                'BUY',
                'SELL'
            )
        },
        type: {
            allowNull: false,
            type: DataTypes.ENUM(
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
            type: DataTypes.ENUM(
                'NEW',
                'PARTIALLY_FILLED',
                'FILLED',
                'CANCELED',
                'REJECTED',
                'EXPIRED',
                'ERROR'
            )
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
    Order.associate = function ({Client, Deal}) {
        Order.belongsTo(Client, {as: 'client'});
        Order.belongsTo(Deal, {as: 'deal'});
    };
    return Order;
};