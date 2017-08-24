'use strict';

const R = require('ramda');

const transformToColumn = require('./transformToColumn'),
      commaSeparate     = R.join(', ');

const ascend = (a,b) => a - b;

const prepareField  = R.addIndex(R.map)((field, position) => '$' + (position + 1));
const prepareFields = R.compose(s => `(${s})`, commaSeparate, prepareField);

/**
 * Converts an array of fields into an insert column list for SQL
 * @param {Array} fields
 * @returns {String}
 */
const prepareProvidedFieldsForInsert = fields => R.compose(
  R.concat(R.__, prepareFields(fields)),
  s => `(${s}) VALUES `,
  commaSeparate,
  R.map(transformToColumn),
  R.sort(ascend)
)(fields);

module.exports = prepareProvidedFieldsForInsert;
