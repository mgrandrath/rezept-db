"use strict";

const object = require("./object.js");

describe("deepmerge", () => {
  it("should return an object when called without arguments", () => {
    expect(object.deepmerge()).toEqual({});
  });

  it("should merge a single object", () => {
    const a = { foo: "bar" };
    expect(object.deepmerge(a)).toHaveProperty("foo", "bar");
  });

  it("should merge the values", () => {
    const a = {
      "key-a": "foo",
      "some-key": {
        "sub-key-a": "bar",
        "some-sub-key": "value-a",
      },
    };
    const b = {
      "key-b": "bar",
      "some-key": {
        "sub-key-b": "bar",
        "some-sub-key": "value-b",
      },
    };
    expect(object.deepmerge(a, b)).toHaveProperty("key-a", "foo");
    expect(object.deepmerge(a, b)).toHaveProperty("key-b", "bar");
    expect(object.deepmerge(a, b)).toHaveProperty(
      ["some-key", "sub-key-a"],
      "bar"
    );
    expect(object.deepmerge(a, b)).toHaveProperty(
      ["some-key", "sub-key-b"],
      "bar"
    );
    expect(object.deepmerge(a, b)).toHaveProperty(
      ["some-key", "some-sub-key"],
      "value-b"
    );
  });

  it("should override array from right to left", () => {
    const a = {
      "key-a": "foo",
      "some-key": [1, 2, 3],
    };
    const b = {
      "key-b": "bar",
      "some-key": [4, 5, 6],
    };
    expect(object.deepmerge(a, b)).toHaveProperty("key-a", "foo");
    expect(object.deepmerge(a, b)).toHaveProperty("key-b", "bar");
    expect(object.deepmerge(a, b)).toHaveProperty("some-key", [4, 5, 6]);
  });

  it("should treat undefined and null values as empty objects", () => {
    const a = { foo: "bar" };

    expect(object.deepmerge(a, undefined, null)).toEqual({ foo: "bar" });
  });
});
