const {
    IndexController,
    InfoController,
    StatsController,
    PatternsController
} = require('./controllers');

module.exports = app => {

    app.get('/status', IndexController.status);

    app.get('/stats', StatsController.index);
    app.get('/stats/performance', StatsController.performance);

    app.get('/info/symbol', InfoController.symbol);
    app.get('/info/exchange', InfoController.exchange);

    app.get('/patterns/find', PatternsController.find);

};
