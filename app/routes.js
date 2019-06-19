const {IndexController, StatsController} = require('./controllers');

module.exports = app => {

    app.get('/status', IndexController.status);

    app.get('/stats', StatsController.index);


};
