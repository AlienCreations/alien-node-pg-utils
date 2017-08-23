'use strict';

const beginTransaction = require('../lib/methods/beginTransaction');

const constants = require('../lib/constants');

const FAKE_ERROR = new Error('fake error');

const FAKE_CONNECTION_GOOD = {
  query : (q, cb) => cb()
};

const FAKE_CONNECTION_BAD = {
  query : (q, cb) => cb(FAKE_ERROR)
};

const FAKE_DB_POOL_GOOD = {
  connect : () => Promise.resolve(FAKE_CONNECTION_GOOD)
};

const FAKE_DB_POOL_BAD = {
  connect : () => Promise.reject(FAKE_ERROR)
};

const FAKE_DB_POOL_GOOD_BAD_QUERY = {
  connect : () => Promise.resolve(FAKE_CONNECTION_BAD)
};

const FAKE_DB_POOL_GOOD_WITH_BAD_CONNECTION = {
  connect : () => Promise.reject(FAKE_ERROR)
};

const FAKE_DB_POOL_GOOD_WITH_MISSING_CONNECTION = {
  connect : () => Promise.reject(constants.errors.MISSING_CONNECTION)
};

const FAKE_CORRUPTED_DB_POOL_OBJ = {};

describe('beginTransaction', () => {

  it('takes a db pool, gets a connection, invokes the beginTransaction method, and resolves the connection if successful', done => {
    beginTransaction(FAKE_DB_POOL_GOOD)()
      .then(connection => {
        expect(connection).toBe(FAKE_CONNECTION_GOOD);
        done();
      });
  });

  it('takes a db pool, and rejects the promise if there is an error', done => {
    beginTransaction(FAKE_DB_POOL_BAD)()
      .catch(err => {
        expect(err).toBe(FAKE_ERROR);
        done();
      })
  });

  it('takes a db pool, gets a connection, invokes the beginTransaction method, and rejects the promise if there is an error', done => {
    beginTransaction(FAKE_DB_POOL_GOOD_WITH_BAD_CONNECTION)()
      .catch(err => {
        expect(err).toBe(FAKE_ERROR);
        done();
      })
  });

  it('takes a db pool, gets a connection, invokes the beginTransaction method, and rejects the promise if there is an error', done => {
    beginTransaction(FAKE_DB_POOL_GOOD_BAD_QUERY)()
      .catch(err => {
        expect(err).toBe(FAKE_ERROR);
        done();
      })
  });

  it('takes a db pool, gets a connection, invokes the beginTransaction method, and rejects the promise if there is an error', done => {
    beginTransaction(FAKE_DB_POOL_GOOD_WITH_MISSING_CONNECTION)()
      .catch(err => {
        expect(err).toBe(constants.errors.MISSING_CONNECTION);
        done();
      })
  });

  it('takes a db pool, and rejects the promise if there are any thrown exceptions', done => {
    beginTransaction(FAKE_CORRUPTED_DB_POOL_OBJ)()
      .catch(err => {
        expect(err.message).toBe('dbPool.connect is not a function');
        done();
      })
  });

});
