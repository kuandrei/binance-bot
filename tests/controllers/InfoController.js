const should = require('chai').should();
const server = require('../../app/server');
const request = require('supertest');

// wait until server is started
before(function (done) {
    if (server.started)
        return done();
    server.once('started', done);
});

describe('test Info Controller', function () {

    it('test (GET /info/symbol) action - should return 200', function (done) {

        request(server)
            .get('/info/symbol?symbol=XRPBTC')
            .send()
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                let response = {};
                should.not.throw(function () {
                    response = JSON.parse(res.text);
                }, 'response is not a JSON');
                response.should.be.an('object');
                done();
            });

    });

    it('test (GET /info/exchange) action - should return 200', function (done) {

        request(server)
            .get('/info/exchange?symbol=XRPBTC')
            .send()
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                let response = {};
                should.not.throw(function () {
                    response = JSON.parse(res.text);
                }, 'response is not a JSON');
                response.should.be.an('object');
                done();
            });

    });

});
