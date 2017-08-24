'use strict';

const R = require('ramda');

const transformToColumn = require('./transformToColumn'),
      commaSeparate     = R.join(',');

const ascend = (a,b) => a - b;

/**
 * Converts an array of fields into an insert column list for SQL
 * @param {Array} fields
 * @returns {String}
 */
const prepareProvidedFieldsForInsert = R.compose(
  s => `(${s})`,
  R.join(','),
  R.map(transformToColumn),
  R.sort(ascend)
);

module.exports = prepareProvidedFieldsForInsert;
