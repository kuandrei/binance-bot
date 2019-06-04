const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = module.exports = express();
const models = require("./models");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// load routes
require('./routes')(app);

// load crons
require('./crons')(app);

// set the port
const port = process.env.PORT || 80;

// start the app
models.sequelize.sync().then(function () {
    app.listen(port, () => {

        console.log(`Server is running on port ${port}`); // eslint-disable-line no-console

        // emit started event
        app.started = true;
        app.emit('started');
    })
});
