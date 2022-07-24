"use strict";

import { type EventEmitter } from "node:events";

interface Events extends Array<any> {
  consume: () => any[];
  discard: () => void;
}

export const trackEvents = (emitter: EventEmitter, eventType: string) => {
  const events: any[] = [];

  const handleEvent = (event: any) => events.push(event);
  emitter.on(eventType, handleEvent);

  const consume = () => {
    const result = [...events];
    events.length = 0;
    return result;
  };

  const discard = () => {
    emitter.off(eventType, handleEvent);
    consume();
  };

  // We define non-enumerable properties here b/c otherwise Jest's .toEqual()
  // comparisons fail.
  Object.defineProperty(events, "consume", {
    enumerable: false,
    value: consume,
  });
  Object.defineProperty(events, "discard", {
    enumerable: false,
    value: discard,
  });

  return events as Events;
};
