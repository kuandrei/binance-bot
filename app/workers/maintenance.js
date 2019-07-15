const debug = require('debug')('bnb:workers:analyze-trade-pair');
const errorHandler = require('./../helpers/error-handler');
const {symbolInfo, Sequelize} = require('./../models');


module.exports = async () => {

    try {
        debug('MAINTENANCE');

        await symbolInfo.destroy({
            where: {
                createdAt: {
                    [Sequelize.Op.lt]: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000))
                }
            }
        })

    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }

};