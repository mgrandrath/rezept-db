import deepmergeLib from "deepmerge";

const overrideArrayMerge = (destinationArray, sourceArray) => sourceArray;
export const deepmerge = (...objects) =>
  deepmergeLib.all(
    objects.filter((object) => Boolean(object)),
    { arrayMerge: overrideArrayMerge }
  );
