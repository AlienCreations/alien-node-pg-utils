'use strict';

const R = require('ramda');

const transformQueryResponse   = require('./transformQueryResponse'),
      ensureNotSingleItemArray = require('./ensureNotSingleItemArray'),
      constants                = require('../constants');

const isNilOrEmpty = R.anyPass([R.isNil, R.isEmpty]);

const maybeRollbackAndRelease = (connection, transaction, deferred, rejectWith) => {
  if (transaction) {
    connection.query('ROLLBACK', err => {
      connection.release();
      if (err) {
        deferred.reject(err);
      } else {
        deferred.reject(rejectWith);
      }
    });
  } else {
    connection.release();
    deferred.reject(rejectWith);
  }
};

const maybeEnsureSingleItemArray = singleReturnItem => data => singleReturnItem ? ensureNotSingleItemArray(data) : data;

const _queryCallback = (deferred, connection, transaction, singleReturnItem, allowEmptyResponse) => (err, res) => {

  if (err) {
    switch (R.prop('code', err)) {
      case 'ER_DUP_ENTRY' :
        maybeRollbackAndRelease(connection, transaction, deferred, constants.errors.DUPLICATE(R.prop('message', err)));
        break;
      default :
        maybeRollbackAndRelease(connection, transaction, deferred, constants.errors.UNKNOWN(R.prop('message', err)));
        break;
    }
    return deferred.promise;

  } else {

    const data = R.propOr([], 'rows', res);

    if (isNilOrEmpty(data)) {

      if (allowEmptyResponse) {
        if (!transaction) {
          connection.release();
        }

        deferred.resolve(singleReturnItem ? { data : undefined } : { data : [] })
      } else {
        connection.release();
        deferred.reject(constants.errors.NO_QUERY_RESULTS);
      }

      return deferred.promise;

    } else {
      const transformedData = R.compose(transformQueryResponse, maybeEnsureSingleItemArray(singleReturnItem))(data);
      const meta            = R.omit(['rows'], res);

      if (!transaction) {
        connection.release();
      }

      deferred.resolve(transaction ?
                       { data : transformedData, meta, connection } :
                       { data : transformedData, meta }
                      );

      return deferred.promise;
    }
  }
};

module.exports = _queryCallback;
