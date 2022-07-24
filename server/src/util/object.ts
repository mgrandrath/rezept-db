"use strict";

import deepEqual from "deep-equal";
import deepmergeLib from "deepmerge";

export const equals = (a: Readonly<{}>, b: Readonly<{}>) => {
  return deepEqual(a, b, { strict: true });
};

type Primitive = string | number | boolean | undefined | null;

export const contains = (
  a: Primitive | Readonly<any>,
  b: Primitive | Readonly<any>
): boolean => {
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
      a.length === (b as any[]).length &&
      (b as any[]).every((value: Readonly<any>, index: number) =>
        contains(a[index], value)
      )
    );
  }

  if (typeof a === "object") {
    return Object.entries(b as {}).every(([key, value]) =>
      contains(a[key], value as any)
    );
  }

  return false;
};

const overrideArrayMerge = (
  destinationArray: object[],
  sourceArray: object[]
) => sourceArray;
export const deepmerge = (
  ...objects: ReadonlyArray<object | undefined | null>
) =>
  deepmergeLib.all(
    // Removing non-objects by filtering would be preferable but unfortunately
    // leads to a TypeError when running tests with Jest (v27.5.1).
    objects.map((object) => object ?? {}),
    { arrayMerge: overrideArrayMerge }
  );

export const mapValues = <T, U = T>(
  object: Readonly<Record<string, T>>,
  f: (value: T) => U
): Record<string, U> =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, f(value)])
  );

export const removeUndefinedValues = (object: Readonly<Record<string, any>>) =>
  Object.fromEntries(
    Object.entries(object).filter(([key, value]) => value !== undefined)
  );
