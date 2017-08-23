'use strict';

const constants = require('../lib/constants'),
      getConnection    = require('../lib/methods/getConnection');

const FAKE_ERROR = new Error('fake error');

const FAKE_CONNECTION = { query : () => {} };

const FAKE_POOL_GOOD = {
  connect : () => Promise.resolve(FAKE_CONNECTION),
  release : () => {}
};

const FAKE_POOL_MISSING_CONNECTION = {
  connect : () => Promise.resolve(),
  release : () => {}
};

const FAKE_POOL_BAD = {
  connect  : () => Promise.reject(constants.errors.UNKNOWN(FAKE_ERROR.message)),
  release  : () => {}
};

describe('getConnection', () => {

  it('takes a pool, invokes the connect method, and resolves the connection if successful', (done) => {
    getConnection(FAKE_POOL_GOOD)()
      .then(connection => {
        expect(connection).toBe(FAKE_CONNECTION);
        done();
      })
  });

  it('takes a pool, invokes the connect method, and rejects the promise if there is an error', (done) => {
    getConnection(FAKE_POOL_BAD)()
      .catch(err => {
        expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
        done();
      })
  });

  it('takes a pool, invokes the connect method, and rejects the promise if the connection can not be referenced', (done) => {
    getConnection(FAKE_POOL_MISSING_CONNECTION)()
      .catch(err => {
        expect(err).toEqual(constants.errors.MISSING_CONNECTION);
        done();
      })
  });

});
