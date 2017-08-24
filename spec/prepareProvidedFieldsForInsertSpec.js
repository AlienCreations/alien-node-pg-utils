'use strict';

const prepareProvidedFieldsForInsert = require('../lib/methods/prepareProvidedFieldsForInsert');

describe('prepareProvidedFieldsForInsert', () => {
  it('makes a prepared statement for each field, sorted alphabetically by column name', () => {
    expect(prepareProvidedFieldsForInsert(['foo', 'baa', 'bar'])).toBe('(baa, bar, foo) VALUES ($1, $2, $3)');
  });
});
