'use strict';

const R = require('ramda');

const transformQueryResponse   = require('./transformQueryResponse'),
      ensureNotSingleItemArray = require('./ensureNotSingleItemArray'),
      constants                = require('../constants');

const hasNoRows       = R.compose(R.equals(0), R.length, R.prop('rows'));
const hasNoRowCount   = R.compose(R.equals(0), R.prop('rowCount'));
const isEmptyResponse = R.both(hasNoRows, hasNoRowCount);

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

const maybeEnsureSingleItemArray = singleReturnItem => rows => singleReturnItem ? ensureNotSingleItemArray(rows) : rows;

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

    const rows = R.propOr([], 'rows', res);

    if (isEmptyResponse(res)) {

      if (allowEmptyResponse) {
        const data = singleReturnItem ? undefined : [];
        const meta = R.omit(['rows'], res);

        if (!transaction) {
          connection.release();
        }

        deferred.resolve(transaction ?
          { data, meta, connection } :
          { data, meta }
        );

      } else {
        connection.release();
        deferred.reject(constants.errors.NO_QUERY_RESULTS);
      }

      return deferred.promise;

    } else {
      const data = R.compose(transformQueryResponse, maybeEnsureSingleItemArray(singleReturnItem))(rows);
      const meta = R.omit(['rows'], res);

      if (!transaction) {
        connection.release();
      }

      deferred.resolve(transaction ?
                       { data, meta, connection } :
                       { data, meta }
                      );

      return deferred.promise;
    }
  }
};

module.exports = _queryCallback;
