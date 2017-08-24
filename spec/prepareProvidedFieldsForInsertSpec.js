'use strict';

const prepareProvidedFieldsForInsert = require('../lib/methods/prepareProvidedFieldsForInsert');

describe('prepareProvidedFieldsForInsert', () => {
  it('makes a prepared statement for each field, sorted alphabetically by column name', () => {
    expect(prepareProvidedFieldsForInsert(['foo', 'bar'])).toBe('("foo","bar")');
  });
});
