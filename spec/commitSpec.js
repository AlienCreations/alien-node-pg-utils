'use strict';

const constants = require('../lib/constants'),
      commit    = require('../lib/methods/commit');

const FAKE_ERROR = new Error('fake error');

const FAKE_CONNECTION_GOOD = {
  query   : (q, cb) => cb(),
  release : () => {}
};

const FAKE_CONNECTION_BAD = {
  query    : (q, cb) => cb(constants.errors.UNKNOWN(FAKE_ERROR.message)),
  release  : () => {}
};

const FAKE_CONNECTION_FAILED_COMMIT_SUCCESSFUL_ROLLBACK = {
  query   : (q, cb) => q === 'COMMIT' ? cb(constants.errors.UNKNOWN(FAKE_ERROR.message)) : cb(),
  release : () => {}
};

describe('commit', () => {

  it('takes a connection, invokes the commit method, and resolves the connection if successful', (done) => {
    commit(FAKE_CONNECTION_GOOD)
      .then(res => {
        expect(res).toBe(true);
        done();
      })
  });

  it('takes a connection, invokes the commit method, and rejects the promise if there is an error', (done) => {
    commit(FAKE_CONNECTION_BAD)
      .catch(err => {
        expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
        done();
      })
  });

  it('takes a connection, invokes the commit method, and rejects the promise if there is an error', (done) => {
    commit(FAKE_CONNECTION_FAILED_COMMIT_SUCCESSFUL_ROLLBACK)
      .catch(err => {
        expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
        done();
      })
  });

});
