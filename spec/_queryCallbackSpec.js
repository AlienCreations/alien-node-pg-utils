'use strict';

const Q = require('q'),
      R = require('ramda');

const constants      = require('../lib/constants'),
      _queryCallback = require('../lib/methods/_queryCallback');

const MYSQL_DUPLICATE_ENTRY_ERROR_CODE = 'ER_DUP_ENTRY';

const pgResObj = R.objOf('rows');

const FAKE_ERROR                  = new Error('foobar'),
      FAKE_DUPLICATE_RECORD_ERROR = {code : MYSQL_DUPLICATE_ENTRY_ERROR_CODE, message : 'foo duplicate'},
      FAKE_RESPONSE_SINGLE        = pgResObj({foo : 'bar'}),
      FAKE_RESPONSE_SINGLE_ARRAY  = pgResObj([{foo : 'bar'}]),
      FAKE_RESPONSE_ARRAY         = pgResObj([{foo : 'bar'}, {baz : 'bat'}, {biz : 'buz'}]);

const IS_TRANSACTION_FALSE       = false,
      IS_TRANSACTION_TRUE        = true,
      SINGLE_RETURN_ITEM_FALSE   = false,
      SINGLE_RETURN_ITEM_TRUE    = true,
      ALLOW_EMPTY_RESPONSE_FALSE = false,
      ALLOW_EMPTY_RESPONSE_TRUE  = true;

const FAKE_CONNECTION = {
  query   : (q, cb) => cb(constants.errors.UNKNOWN(FAKE_ERROR.message)),
  release : () => {}
};

const FAKE_CONNECTION_INFER_ERROR = {
  query   : (q, cb) => cb(),
  release : () => {}
};

describe('_queryCallback', () => {

  beforeEach(() => {
    spyOn(FAKE_CONNECTION, 'release');
  });

  it('invokes a transactional queryOnTransaction() callback with no errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.connection).toEqual(FAKE_CONNECTION);
      expect(res.data).toEqual(FAKE_RESPONSE_ARRAY.rows);
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_TRUE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_ARRAY);
  });

  it('invokes a transactional, queryOnTransaction() callback with errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_TRUE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a transactional, queryOnTransaction() callback with errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION_INFER_ERROR,
      IS_TRANSACTION_TRUE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, query() callback with no errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_ARRAY.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_ARRAY);
  });

  it('invokes a non-transaction, query() callback with no errors on an empty result', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.NO_QUERY_RESULTS);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, []);
  });

  it('invokes a non-transaction, query() callback with no errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE_ARRAY.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_SINGLE_ARRAY);
  });

  it('invokes a non-transaction, query() callback with no errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_SINGLE);
  });

  it('invokes a non-transaction, querySafe() callback with no errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_ARRAY.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, FAKE_RESPONSE_ARRAY);
  });

  it('invokes a non-transaction, querySafe() callback with no errors on an empty response', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual([]);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, []);
  });

  it('invokes a transaction, querySafe() callback with no errors on an empty response', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual([]);
      expect(FAKE_CONNECTION.release).not.toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_TRUE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, []);
  });


  it('invokes a non-transaction, querySafe() callback with no errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE_ARRAY.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, FAKE_RESPONSE_SINGLE_ARRAY);
  });

  it('invokes a non-transaction, querySafe() callback with no errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, FAKE_RESPONSE_SINGLE);
  });


  it('invokes a non-transaction, lookup() callback with no errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_ARRAY.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_ARRAY);
  });

  it('invokes a non-transaction, lookup() callback with no errors on an empty response', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.NO_QUERY_RESULTS);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, []);
  });

  it('invokes a non-transaction, lookup() callback with no errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_SINGLE_ARRAY);
  });

  it('invokes a non-transaction, lookup() callback with no errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(null, FAKE_RESPONSE_SINGLE);
  });

  it('invokes a non-transaction, lookupSafe() callback with no errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_ARRAY.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, FAKE_RESPONSE_ARRAY);
  });

  it('invokes a non-transaction, lookupSafe() callback with no errors on an empty response', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(undefined);
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, []);
  });

  it('invokes a non-transaction, lookupSafe() callback with no errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, FAKE_RESPONSE_SINGLE_ARRAY);
  });

  it('invokes a non-transaction, lookupSafe() callback with no errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.then(res => {
      expect(res.data).toEqual(FAKE_RESPONSE_SINGLE.rows);
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(null, FAKE_RESPONSE_SINGLE);
  });

  it('handles a duplicate-record error no differently than other errors', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.DUPLICATE(FAKE_DUPLICATE_RECORD_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_DUPLICATE_RECORD_ERROR);
  });

  it('invokes a non-transaction, query() callback with errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, query() callback with errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, query() callback with errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, querySafe() callback with errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, querySafe() callback with errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, querySafe() callback with errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_FALSE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(FAKE_ERROR);
  });


  it('invokes a non-transaction, lookup() callback with errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, lookup() callback with errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, lookup() callback with errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_FALSE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, lookupSafe() callback with errors on a multi-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, lookupSafe() callback with errors on a single-item array', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(FAKE_ERROR);
  });

  it('invokes a non-transaction, lookupSafe() callback with errors on a response object', done => {

    const deferred = Q.defer();

    deferred.promise.catch(err => {
      expect(err).toEqual(constants.errors.UNKNOWN(FAKE_ERROR.message));
      expect(FAKE_CONNECTION.release).toHaveBeenCalled();
      done();
    });

    _queryCallback(
      deferred,
      FAKE_CONNECTION,
      IS_TRANSACTION_FALSE,
      SINGLE_RETURN_ITEM_TRUE,
      ALLOW_EMPTY_RESPONSE_TRUE
    )(FAKE_ERROR);
  });

});
