'use strict';

const R = require('ramda');

const createNowDateString = require('../lib/methods/createNowDateString');

const _getPrefixedMonth = date => {
  return ('0' + (date.getMonth() + 1)).slice(-2);
};

const _getPrefixedDay = date => {
  return ('0' + date.getDate()).slice(-2);
};

const ymdFormatted = () => {
  const date = new Date();

  return R.join('-', [
    date.getFullYear(),
    _getPrefixedMonth(date),
    _getPrefixedDay(date)
  ]);
};

describe('createNowDateString', () => {
  it('creates a YYYY-MM-DD date string', () => {
    expect(createNowDateString()).toBe(ymdFormatted())
  });
});
