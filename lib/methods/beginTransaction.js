'use strict';

const Q = require('q');

const getConnection = require('./getConnection');

module.exports = dbPool => () => {
  const deferred = Q.defer();

  getConnection(dbPool)()
    .then(connection => {
      connection.query('BEGIN', err => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(connection);
        }
      });
    })
    .catch(err => {
      deferred.reject(err);
    });

  return deferred.promise;
};

