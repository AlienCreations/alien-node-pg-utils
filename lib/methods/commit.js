'use strict';

const Q = require('q');

module.exports = connection => {
  const deferred = Q.defer();

  connection.query('COMMIT', err => {
    if (err) {
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
      deferred.resolve(true);
    }
  });

  return deferred.promise;
};
