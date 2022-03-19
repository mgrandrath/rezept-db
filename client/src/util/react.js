import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useOnlyWhenMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (f) => {
    if (isMountedRef.current) {
      f();
    }
  };
};

const searchParamsToObject = (urlSearchParams) =>
  Object.fromEntries(urlSearchParams.entries());

export const useUrlState = (defaultValues) => {
  const [filterParams, setFilterParams] = useSearchParams(defaultValues);
  const filter = searchParamsToObject(filterParams);
  const setFilter = (filter) => setFilterParams(filter, { replace: true });

  return [filter, setFilter];
};

const randomString = () => Math.random().toString(36).substring(2);

export const useRerenderChild = () => {
  const [key, setKey] = useState(randomString());
  const rerenderChild = () => {
    setKey(randomString());
  };

  return [key, rerenderChild];
};
