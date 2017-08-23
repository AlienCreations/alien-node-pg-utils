'use strict';

const Q = require('q');

const constants = require('../constants');

const getConnection = dbPool => () => {
  const deferred = Q.defer();

  try {

    dbPool.connect()
      .then(connection => {
        if (connection) {
          deferred.resolve(connection);
        } else {
          deferred.reject(constants.errors.MISSING_CONNECTION);
        }
      })
      .catch(deferred.reject);

  } catch(err) {
    deferred.reject(err);
  }

  return deferred.promise;
};

module.exports = getConnection;
