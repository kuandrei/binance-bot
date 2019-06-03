const should = require('chai').should();
const server = require('./../app/server');
const request = require('supertest');

// wait till server is started
before(function (done) {
    if (server.started)
        return done();
    server.once('started', done);
});


let msCtx = {
    requester: {
        id: 12345,
        type: 'user',
        ip: '127.0.0.1'
    },
    scope: {
        resellerId: 'webs',
        accountId: 1000,
        siteId: 9999
    }
};


describe('Public APIs', function () {

    it('(GET /status) - check test endpoint', function (done) {

        request(server)
            .get('/status')
            .set('x-ms-ctx', JSON.stringify(msCtx))
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
