import axios from "axios";
import { stringify as stringifyQuery } from "query-string";

const flattenNestedValues = (params) =>
  Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.entries(value).map(([nestedKey, nestedValue]) => [
          `${key}[${nestedKey}]`,
          nestedValue,
        ]);
      }

      return [[key, value]];
    })
  );

export const contentTypes = {
  JSON: {
    headers: { "Content-Type": "application/json;charset=utf-8" },
    stringify: JSON.stringify,
  },
  NONE: {
    headers: {},
    stringify: (body) => body,
  },
};

export const sendRequest = async (request) => {
  const contentType = request.contentType ?? contentTypes.NONE;

  const response = await axios.request({
    method: request.method,
    url: request.url,
    headers: {
      ...request.headers,
      ...contentType.headers,
    },
    paramsSerializer: (params) =>
      stringifyQuery(flattenNestedValues(params), { skipEmptyString: true }),
    params: request.query,
    data: contentType.stringify(request.data),
  });

  return {
    status: response.status,
    headers: response.headers,
    data: response.data,
  };
};
