'use strict';
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RunTimeError', {
        message: {
            allowNull: false,
            type: DataTypes.STRING(256)
        },
        error: DataTypes.JSON,
        details: DataTypes.JSON
    }, {});
};