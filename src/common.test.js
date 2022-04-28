const c = require('./common');

test('Distance between vectors', () => {
  expect(c.dist({x:0,y:0}, {x:3,y:4})).toBe(5);
});