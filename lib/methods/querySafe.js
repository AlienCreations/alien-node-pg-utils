'use strict';

const EXPECT_SINGLE_RETURN_ITEM = false,
      ALLOW_EMPTY_RESPONSE      = true,
      CONNECTION                = null;

/**
 * Execute a query, expecting an array returned.
 */
module.exports = require('./_transaction')(CONNECTION, EXPECT_SINGLE_RETURN_ITEM, ALLOW_EMPTY_RESPONSE);
