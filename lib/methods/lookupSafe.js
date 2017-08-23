'use strict';

const EXPECT_SINGLE_RETURN_ITEM = true,
      ALLOW_EMPTY_RESPONSE      = true,
      CONNECTION                = null;

/**
 * Execute a query, expecting a single item returned.
 */
module.exports = require('./_transaction')(CONNECTION, EXPECT_SINGLE_RETURN_ITEM, ALLOW_EMPTY_RESPONSE);
