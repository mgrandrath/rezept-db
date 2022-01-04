"use strict";

expect.extend({
  toContainMatchingObject(array, object) {
    const prettyArray = this.utils.printReceived(array);
    const prettyObject = this.utils.printExpected(object);

    try {
      expect(array).toContainEqual(expect.objectContaining(object));
      return {
        pass: true,
        message: () =>
          `Expected value: not ${prettyObject}\n` +
          `Received array:     ${prettyArray}`,
      };
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `Expected value: ${prettyObject}\n` +
          `Received array: ${prettyArray}`,
      };
    }
  },
});
