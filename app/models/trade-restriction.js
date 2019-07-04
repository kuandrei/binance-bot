'use strict';
module.exports = (sequelize, DataTypes) => {
    const TradeRestriction = sequelize.define('TradeRestriction', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(128)
        },
        filter: {
            type: DataTypes.JSON
        }
    }, {});
    TradeRestriction.associate = function ({Client}) {
        TradeRestriction.belongsTo(Client, {as: 'client'});
    };
    return TradeRestriction;
};