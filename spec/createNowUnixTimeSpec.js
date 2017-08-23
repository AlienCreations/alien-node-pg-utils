'use strict';

const createNowUnixTime = require('../lib/methods/createNowUnixTime');

describe('createNowUnixTime', () => {
  it('creates a Unix time stamp', () => {
    expect(createNowUnixTime()).toBe(Math.floor(new Date().getTime() / 1000));
  });
});
