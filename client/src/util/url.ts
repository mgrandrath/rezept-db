import { generatePath } from "react-router-dom";

export const urlPath = (
  parts: TemplateStringsArray,
  ...params: ReadonlyArray<string>
) =>
  params
    .map(encodeURIComponent)
    .reduce((path, param, index) => path + param + parts[index + 1], parts[0]);

type Params = Record<string, string | number | boolean>;

export const encodeParams = (params: Readonly<Params>) =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      encodeURIComponent(value),
    ])
  );

export const safeGeneratePath = (path: string, params: Readonly<Params>) =>
  generatePath(path, encodeParams(params));
