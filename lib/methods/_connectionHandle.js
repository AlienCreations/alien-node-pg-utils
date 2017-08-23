'use strict';

const _queryCallback = require('./_queryCallback'),
      constants      = require('../constants');

const _connectionHandle = (deferred, queryStatement, transaction, singleReturnItem, allowEmptyResponse) => (err, connection) => {

  const preparedStatement = queryStatement[0],
        valueSwapIns      = queryStatement[1];

  if (!connection) {
    deferred.reject(constants.errors.NO_DB_CONNECTION);
    return deferred.promise;
  }

  if (err) {

    if (transaction) {
      connection.query('ROLLBACK', _err => {
        connection.release();
        if (_err) {
          deferred.reject(_err);
        } else {
          deferred.reject(err);
        }
      });
    } else {
      connection.release();
      deferred.reject(err);
    }

  }

  connection.query(
    preparedStatement,
    valueSwapIns,
    _queryCallback(deferred, connection, transaction, singleReturnItem, allowEmptyResponse)
  );

  return deferred.promise;
};

module.exports = _connectionHandle;
