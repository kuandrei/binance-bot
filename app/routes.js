const {
    IndexController,
    StatsController,
    PatternsController
} = require('./controllers');

module.exports = app => {

    app.get('/status', IndexController.status);

    app.get('/stats', StatsController.index);
    app.get('/stats/performance', StatsController.performance);
    app.get('/stats/symbolInfo', StatsController.symbolInfo);

    app.get('/patterns/find', PatternsController.find);

};
