import { useEffect, useRef } from "react";

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
