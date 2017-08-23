'use strict';

const transformToColumn = require('../lib/methods/transformToColumn');

describe('transformToColumn', () => {
  it('transforms a string from the case used ' +
    'for MySQL fields to the case used for JS variables', () => {
    expect(transformToColumn('someDbField')).toBe('`some_db_field`');
  });
});
