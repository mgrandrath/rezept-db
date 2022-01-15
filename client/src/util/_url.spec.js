import * as url from "./url.js";

describe("urlPath", () => {
  it("should escape path params", () => {
    const someParam = "with whitespace";
    const otherParam = "with/slash";
    const path = url.urlPath`/some/path/${someParam}/${otherParam}/`;

    expect(path).toEqual("/some/path/with%20whitespace/with%2Fslash/");
  });
});
