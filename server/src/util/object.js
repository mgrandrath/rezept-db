"use strict";

const deepEqual = require("deep-equal");
const deepmerge = require("deepmerge");

exports.equals = (a, b) => {
  return deepEqual(a, b, { strict: true });
};

const contains = (a, b) => {
  if (a === b) {
    return true;
  }

  if (Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  if (a === null || b === null) {
    return false;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    return (
      a.length === b.length &&
      b.every((value, index) => contains(a[index], value))
    );
  }

  if (typeof a === "object") {
    return Object.entries(b).every(([key, value]) => contains(a[key], value));
  }

  return false;
};
exports.contains = contains;

const overrideArrayMerge = (destinationArray, sourceArray) => sourceArray;
exports.deepmerge = (...objects) =>
  deepmerge.all(
    objects.filter((object) => Boolean(object)),
    { arrayMerge: overrideArrayMerge }
  );

exports.mapValues = (object, f) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, f(value)])
  );

exports.removeUndefinedValues = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(([key, value]) => value !== undefined)
  );
