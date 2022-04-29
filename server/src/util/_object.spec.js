"use strict";

const object = require("./object.js");

describe("equals", () => {
  it("should return true when two objects are equal", () => {
    const a = {
      prop: "some-value",
    };
    const b = {
      prop: "some-value",
    };
    expect(object.equals(a, b)).toEqual(true);
  });

  it("should return false when two objects are not equal", () => {
    const a = {
      prop: "some-value",
    };
    const b = {
      prop: "other-value",
    };
    expect(object.equals(a, b)).toEqual(false);
  });

  it("should compare properties w/o coercions", () => {
    const a = {
      prop: "4",
    };
    const b = {
      prop: 4,
    };
    expect(object.equals(a, b)).toEqual(false);
  });
});

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

describe("mapValues", () => {
  it("should apply the given mapper function to each value", () => {
    const input = {
      a: "foo",
      b: "bar",
      c: "baz",
    };
    const toUpperCase = (string) => string.toUpperCase();

    expect(object.mapValues(input, toUpperCase)).toEqual({
      a: "FOO",
      b: "BAR",
      c: "BAZ",
    });
  });
});

describe("removeUndefinedValues", () => {
  it("should remove entries with undefined values", () => {
    const input = {
      a: 0,
      b: undefined,
      c: null,
      d: false,
      e: "",
      f: Number.NaN,
    };

    expect(object.removeUndefinedValues(input)).toStrictEqual({
      a: 0,
      c: null,
      d: false,
      e: "",
      f: Number.NaN,
    });
  });
});
