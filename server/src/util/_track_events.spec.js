"use strict";

const EventEmitter = require("node:events");
const { trackEvents } = require("./track_events.js");

const EVENT_TYPE = "myEvent";

describe("trackEvents", () => {
  it("should track emitted events", () => {
    const emitter = new EventEmitter();
    const events = trackEvents(emitter, EVENT_TYPE);

    emitter.emit(EVENT_TYPE, "first output");
    emitter.emit(EVENT_TYPE, "second output");
    emitter.emit("otherEvent", "irrelevant output");

    expect(events).toEqual(["first output", "second output"]);
  });

  it("should discard event tracking", () => {
    const emitter = new EventEmitter();
    const events = trackEvents(emitter, EVENT_TYPE);

    emitter.emit(EVENT_TYPE, "first output");
    events.discard();
    emitter.emit(EVENT_TYPE, "second output");

    expect(events).toEqual([]);
  });

  it("should consume events", () => {
    const emitter = new EventEmitter();
    const events = trackEvents(emitter, EVENT_TYPE);

    emitter.emit(EVENT_TYPE, "first output");
    expect(events.consume()).toEqual(["first output"]);

    emitter.emit(EVENT_TYPE, "second output");
    expect(events.consume()).toEqual(["second output"]);
  });

  it("should support arbitrary data", () => {
    const emitter = new EventEmitter();
    const events = trackEvents(emitter, EVENT_TYPE);

    emitter.emit(EVENT_TYPE, ["first", 1]);
    emitter.emit(EVENT_TYPE, { second: "output" });

    expect(events).toEqual([["first", 1], { second: "output" }]);
  });
});
