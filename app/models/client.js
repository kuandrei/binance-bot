'use strict';
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(128),
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {});
    Client.associate = function (models) {
        Client.hasMany(models.Order, {as: 'orders', foreignKey: 'clientId'});
        Client.hasOne(models.ClientApiSettings, {as: 'api-settings', foreignKey: 'clientId'});
    };
    return Client;
};