import * as url from "./url.js";

describe("urlPath", () => {
  it("should escape path params", () => {
    const someParam = "with whitespace";
    const otherParam = "with/slash";
    const path = url.urlPath`/some/path/${someParam}/${otherParam}/`;

    expect(path).toEqual("/some/path/with%20whitespace/with%2Fslash/");
  });
});

describe("encodeParams", () => {
  it("should url encode all values for use w/ generatePath from react-router-dom", () => {
    const params = {
      paramWithSpace: "foo bar",
      paramWithSlash: "foo/bar",
    };
    expect(url.encodeParams(params)).toEqual({
      paramWithSpace: "foo%20bar",
      paramWithSlash: "foo%2Fbar",
    });
  });
});

describe("safeGeneratePath", () => {
  it("should replace placeholders w/ encoded values", () => {
    const params = {
      p1: "foo bar",
      p2: "foo/bar",
    };
    expect(url.safeGeneratePath("/abc/:p1/:p2", params)).toEqual(
      "/abc/foo%20bar/foo%2Fbar"
    );
  });
});
