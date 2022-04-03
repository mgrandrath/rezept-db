import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const ARRAY_MARKER = "[]";

const addArrayMarker = (key) => `${key}${ARRAY_MARKER}`;
const removeArrayMarker = (key) =>
  key.substring(0, key.length - ARRAY_MARKER.length);
const hasArrayMarker = (key) => key.endsWith(ARRAY_MARKER);

const searchParamsToObject = (urlSearchParams) =>
  [...urlSearchParams.entries()].reduce((entries, [key, value]) => {
    if (value === "true" || value === "false") {
      value = JSON.parse(value);
    }

    if (hasArrayMarker(key)) {
      return {
        ...entries,
        [removeArrayMarker(key)]: (
          entries[removeArrayMarker(key)] ?? []
        ).concat([value]),
      };
    }

    const nestedKey = /^(.*)\[(.*)\]$/.exec(key);
    if (nestedKey) {
      return {
        ...entries,
        [nestedKey[1]]: {
          ...entries[nestedKey[1]],
          [nestedKey[2]]: value,
        },
      };
    }

    return {
      ...entries,
      [key]: value,
    };
  }, {});

const objectToSearchParams = (object) =>
  Object.fromEntries(
    Object.entries(object).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return [[addArrayMarker(key), value]];
      }
      if (value && typeof value === "object") {
        return Object.entries(value).map(([innerKey, innerValue]) => [
          `${key}[${innerKey}]`,
          innerValue,
        ]);
      }

      return [[key, value]];
    })
  );

export const useUrlState = (defaultValues) => {
  const [queryParams, setQueryParams] = useSearchParams(
    objectToSearchParams(defaultValues)
  );
  const state = searchParamsToObject(queryParams);
  const setState = (newStateOrFunction) => {
    const newState =
      typeof newStateOrFunction === "function"
        ? newStateOrFunction(state)
        : newStateOrFunction;
    setQueryParams(objectToSearchParams(newState));
  };

  return [state, setState];
};

const randomString = () => Math.random().toString(36).substring(2);

export const useRerenderChild = () => {
  const [key, setKey] = useState(randomString());
  const rerenderChild = () => {
    setKey(randomString());
  };

  return [key, rerenderChild];
};
