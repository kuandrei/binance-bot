const IndexController = require('./controllers/IndexController');

module.exports = app => {

    app.get('/status', IndexController.status);


};
