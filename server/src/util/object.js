"use strict";

const deepEqual = require("deep-equal");
const deepmerge = require("deepmerge");

exports.equals = (a, b) => {
  return deepEqual(a, b, { strict: true });
};

const overrideArrayMerge = (destinationArray, sourceArray) => sourceArray;
exports.deepmerge = (...objects) =>
  deepmerge.all(
    objects.filter((object) => Boolean(object)),
    { arrayMerge: overrideArrayMerge }
  );
