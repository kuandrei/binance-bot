const {sequelize} = require('../models');

module.exports = {

    status: async (req, res, next) => {
        try {
            await sequelize.authenticate();
            res.json({
                status: 'OK'
            })
        } catch (err) {
            console.log('Unable to connect to the database:', err);
            next(err);
        }
    }
};
