import { generatePath } from "react-router-dom";

export const urlPath = (parts, ...params) =>
  params
    .map(encodeURIComponent)
    .reduce((path, param, index) => path + param + parts[index + 1], parts[0]);

export const encodeParams = (params) =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      encodeURIComponent(value),
    ])
  );

export const safeGeneratePath = (path, params) =>
  generatePath(path, encodeParams(params));
