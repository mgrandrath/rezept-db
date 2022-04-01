import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const ARRAY_MARKER = "[]";

const addArrayMarker = (key) => `${key}${ARRAY_MARKER}`;
const removeArrayMarker = (key) =>
  key.substring(0, key.length - ARRAY_MARKER.length);
const hasArrayMarker = (key) => key.endsWith(ARRAY_MARKER);

const searchParamsToObject = (urlSearchParams) =>
  [...urlSearchParams.entries()].reduce(
    (entries, [key, value]) =>
      hasArrayMarker(key)
        ? {
            ...entries,
            [removeArrayMarker(key)]: (
              entries[removeArrayMarker(key)] ?? []
            ).concat([value]),
          }
        : {
            ...entries,
            [key]: value,
          },
    {}
  );

const objectToSearchParams = (object) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) =>
      Array.isArray(value) ? [addArrayMarker(key), value] : [key, value]
    )
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
