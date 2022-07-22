import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

type State = Readonly<Record<string, any>>;
const isUpdaterFunction = (candidate: any): candidate is CallableFunction =>
  typeof candidate === "function";

const objectToSearchParams = (object: State) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, JSON.stringify(value)])
  );

const searchParamsToObject = (searchParams: Readonly<URLSearchParams>) =>
  Object.fromEntries(
    [...searchParams.entries()].map(([key, value]) => [key, JSON.parse(value)])
  );

export const useUrlState = <T = State>(
  defaultValues: T
): [T, (s: T | ((a: T) => T)) => void] => {
  const [queryParams, setQueryParams] = useSearchParams(
    objectToSearchParams(defaultValues)
  );
  const state = searchParamsToObject(queryParams) as T;
  const setState = (newStateOrFunction: T | ((a: T) => T)) => {
    const newState = isUpdaterFunction(newStateOrFunction)
      ? newStateOrFunction(state)
      : newStateOrFunction;
    setQueryParams(objectToSearchParams(newState));
  };

  return [state, setState];
};

const randomString = () => Math.random().toString(36).substring(2);

export const useRerenderChild = (): [string, () => void] => {
  const [key, setKey] = useState(randomString());
  const rerenderChild = useCallback(() => {
    setKey(randomString());
  }, []);

  return [key, rerenderChild];
};
