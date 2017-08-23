'use strict';

const R = require('ramda'),
      Q = require('q');

const _connectionHandle = require('./_connectionHandle');

const _transaction = R.curry((connection, singleReturnItem, allowEmptyResponse, dbPool, queryStatement) => {
  const deferred    = Q.defer(),
        transaction = !!connection,
        cb          = _connectionHandle(deferred, queryStatement, transaction, singleReturnItem, allowEmptyResponse);

  connection ? cb(null, connection) : dbPool.connect(cb);

  return deferred.promise;
});

module.exports = _transaction;
