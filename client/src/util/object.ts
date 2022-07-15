import deepmergeLib from "deepmerge";

const overrideArrayMerge = (
  destinationArray: object[],
  sourceArray: object[]
) => sourceArray;
export const deepmerge = (
  ...objects: ReadonlyArray<object | undefined | null>
) => {
  return deepmergeLib.all(
    // Removing non-objects by filtering would be preferable but unfortunately
    // leads to a TypeError when running tests with Jest (v27.5.1).
    objects.map((object) => object ?? {}),
    { arrayMerge: overrideArrayMerge }
  );
};
