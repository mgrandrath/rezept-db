"use strict";

expect.extend({
  toContainMatchingObject(array, object) {
    const pass = array.some((item) => {
      try {
        expect(item).toMatchObject(object);
        return true;
      } catch (error) {
        return false;
      }
    });

    const prettyArray = this.utils.printReceived(array);
    const prettyObject = this.utils.printExpected(object);
    const message = pass
      ? () =>
          `Expected value: not ${prettyObject}\n` +
          `Received array:     ${prettyArray}`
      : () =>
          `Expected value: ${prettyObject}\n` +
          `Received array: ${prettyArray}`;

    return { message, pass };
  },
});
