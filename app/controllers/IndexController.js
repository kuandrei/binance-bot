const db = require('../models');
// const {Template} = db;

module.exports = {

    status: async (req, res, next) => {
        try {
            await db.sequelize
                .authenticate();
            res.json({
                status: 'OK'
            })
        } catch (err) {
            console.log('Unable to connect to the database:', err);
            next(err);
        }
    }
};
