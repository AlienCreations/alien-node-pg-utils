'use strict';

module.exports = {
  errors : {
    NO_QUERY_RESULTS : {
      code    : 6000,
      message : 'No results'
    },
    NO_DB_CONNECTION : {
      code    : 6001,
      message : 'Cannot connect to Postgres. Make sure the database is running.'
    },
    DUPLICATE : message => {
      return {
        code    : 6002,
        message : message
      };
    },
    UNKNOWN : message => {
      return {
        code    : 6999,
        message : message
      };
    },
    MISSING_CONNECTION : {
      code    : 6998,
      message : 'There was a problem establishing a database connection. This is likely an application error and not a Postgres error.'
    }
  }
};
