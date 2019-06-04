'use strict';
module.exports = (sequelize, DataTypes) => {
    const ClientApiSettings = sequelize.define('ClientApiSettings', {
        apiKey: {
            allowNull: false,
            type: DataTypes.STRING(128),
        },
        apiSecret: {
            allowNull: false,
            type: DataTypes.STRING(128)
        }
    }, {});
    ClientApiSettings.associate = function ({Client}) {
        ClientApiSettings.belongsTo(Client, {as: 'client'});
    };
    return ClientApiSettings;
};