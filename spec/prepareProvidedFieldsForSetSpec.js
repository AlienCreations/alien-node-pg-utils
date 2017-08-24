'use strict';

const prepareProvidedFieldsForSet = require('../lib/methods/prepareProvidedFieldsForSet');

describe('prepareProvidedFieldsForSet', () => {
  it('makes a prepared statement for each field, sorted alphabetically by column name', () => {
    expect(prepareProvidedFieldsForSet(['foo', 'bar'])).toBe('bar = $1, foo = $2');
  });
});
