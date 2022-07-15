import { useState } from "react";
import { useSearchParams } from "react-router-dom";

type State = Readonly<Record<string, any>>;
type StateUpdater = (a: State) => State;

const objectToSearchParams = (object: State) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, JSON.stringify(value)])
  );

const searchParamsToObject = (searchParams: Readonly<URLSearchParams>) =>
  Object.fromEntries(
    [...searchParams.entries()].map(([key, value]) => [key, JSON.parse(value)])
  );

export const useUrlState = (defaultValues: State) => {
  const [queryParams, setQueryParams] = useSearchParams(
    objectToSearchParams(defaultValues)
  );
  const state = searchParamsToObject(queryParams);
  const setState = (newStateOrFunction: State | StateUpdater) => {
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
