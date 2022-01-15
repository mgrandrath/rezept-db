export const urlPath = (parts, ...params) =>
  params
    .map(encodeURIComponent)
    .reduce((path, param, index) => path + param + parts[index + 1], parts[0]);
