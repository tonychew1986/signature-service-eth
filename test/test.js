const request = require('supertest');
const app = require('../index');

var expect  = require('chai').expect;

describe('Basic endpoint to test if service is active', function () {
    it('GET /test', function (done) {
        request(app)
          .get('/test')
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             expect(res.text).to.be.equal('test');
             return done();
          });
    });
});

describe('Wallet endpoint to get address', function () {
    it('GET testnet /wallet', function (done) {
        request(app)
          .post('/wallet')
          .send({
            network: 'testnet',
            nonce: 0
          })
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             var resAddr = res["text"];
             var resAddrHeaderCheck = resAddr.substring(0,2);
             var resAddrLengthCheck = resAddr.length;

             expect(resAddrHeaderCheck).to.be.equal('0x');
             expect(resAddrLengthCheck).to.be.equal(42);
             return done();
          });
    });

    it('GET mainnet /wallet', function (done) {
        request(app)
          .post('/wallet')
          .send({
            network: 'mainnet',
            nonce: 0
          })
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             var resAddr = res["text"];
             var resAddrHeaderCheck = resAddr.substring(0,2);
             var resAddrLengthCheck = resAddr.length;

             expect(resAddrHeaderCheck).to.be.equal('0x');
             expect(resAddrLengthCheck).to.be.equal(42);
             return done();
          });
    });
});
