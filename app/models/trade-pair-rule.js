'use strict';
module.exports = (sequelize) => {
    return sequelize.define('TradePairRule', {}, {
        timestamps: false
    });
};