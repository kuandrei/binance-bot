const debug = require('debug')('bnb:workers:analyze-trade-pair');
const errorHandler = require('./../helpers/error-handler');
const {symbolInfo} = require('./../models');


module.exports = async () => {

    try {

        await symbolInfo.destroy({
            where: {
                createdAt: {
                    lt:  new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
                }
            }
        })

    } catch (err) {
        errorHandler(err);
        debug(`ERROR: ${err.message}`);
    }

};