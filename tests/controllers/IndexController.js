const should = require('chai').should();
const server = require('../../app/server');
const request = require('supertest');

// wait until server is started
before(function (done) {
    if (server.started)
        return done();
    server.once('started', done);
});

describe('test Index Controller', function () {

    it('test (GET /status) action - check test endpoint', function (done) {

        request(server)
            .get('/status')
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
                response.should.include.keys('status');
                response.status.should.equal('OK');

                done();
            });

    });

});
