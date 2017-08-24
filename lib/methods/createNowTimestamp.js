'use strict';

/**
 * Create a timestamp string in the format like this: 2017-08-24T20:06:25.446Z
 * @returns {String}
 */
module.exports = () => new Date().toISOString();
