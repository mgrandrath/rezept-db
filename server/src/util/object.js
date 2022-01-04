"use strict";

const deepmerge = require("deepmerge");

const overrideArrayMerge = (destinationArray, sourceArray) => sourceArray;
exports.deepmerge = (...objects) =>
  deepmerge.all(
    objects.filter((object) => Boolean(object)),
    { arrayMerge: overrideArrayMerge }
  );
