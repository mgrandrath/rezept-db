"use strict";

exports.trackEvents = (emitter, eventType) => {
  const events = [];

  const handleEvent = (event) => events.push(event);
  emitter.on(eventType, handleEvent);

  // We define non-enumerable properties here b/c otherwise Jest's .toEqual()
  // comparisons fail.
  Object.defineProperty(events, "consume", {
    enumerable: false,
    value: () => {
      const result = [...events];
      events.length = 0;
      return result;
    },
  });
  Object.defineProperty(events, "discard", {
    enumerable: false,
    value: () => {
      emitter.off(eventType, handleEvent);
      events.consume();
    },
  });

  return events;
};
