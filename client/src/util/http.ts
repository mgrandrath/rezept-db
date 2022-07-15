import axios from "axios";
import { stringify as stringifyQuery } from "query-string";

const flattenNestedValues = (
  params: Readonly<Record<string, string | object | Array<any>>>
) =>
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

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type Headers = Record<string, string>;

type ContentType = "JSON" | "NONE";

interface ContentTypeImpl {
  headers: Readonly<Headers>;
  stringify: (body: any) => string;
}

export const contentTypes: Readonly<Record<ContentType, ContentTypeImpl>> = {
  JSON: {
    headers: { "Content-Type": "application/json;charset=utf-8" },
    stringify: JSON.stringify,
  },
  NONE: {
    headers: {},
    stringify: (body: any) => body,
  },
};

interface Request {
  method: HttpMethod;
  url: string;
  headers?: Readonly<Headers>;
  contentType?: ContentTypeImpl;
  query?: object;
  data?: object;
}

export const sendRequest = async (request: Request) => {
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
